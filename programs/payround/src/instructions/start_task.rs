use anchor_lang::{prelude::*, InstructionData};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
// use clockwork_sdk::state::Trigger;
use clockwork_sdk::ThreadProgram;
use solana_program::instruction::Instruction;
use solana_program::sysvar;

use crate::constants::PAYROUND_SEED;
use crate::error::ErrorCode;
use crate::state::{PayroundAccount, Task, TaskStatus};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct StartTask<'info> {
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      has_one=authority,
      has_one=thread,
      has_one=recipient,
      constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub task: Box<Account<'info, Task>>,

    // #[account(mut)]
    // pub thread: Account<'info, Thread>,
    #[account(mut)]
    pub thread: SystemAccount<'info>,

    pub user_id: SystemAccount<'info>,

    #[account(
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,

    #[account(
        mut,
        associated_token::mint=token_mint,
        associated_token::authority = payround_account,
    )]
    pub account_ata: Box<Account<'info, TokenAccount>>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint=token_mint,
        associated_token::authority = recipient,
    )]
    pub recipient_ata: Box<Account<'info, TokenAccount>>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(address = sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = anchor_spl::associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,

    #[account(address = anchor_lang::system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> StartTask<'info> {
    fn into_start_task_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadCreate<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadCreate {
            authority: self.payround_account.to_account_info(),
            payer: self.authority.to_account_info(),
            system_program: self.system_program.to_account_info(),
            thread: self.thread.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<StartTask>, amount: u64) -> Result<()> {
    let target_ix_acct = crate::accounts::ProcessTask {
        account_ata: ctx.accounts.account_ata.key(),
        associated_token_program: ctx.accounts.associated_token_program.key(),
        payround_account: ctx.accounts.payround_account.key(),
        recipient: ctx.accounts.recipient.key(),
        recipient_ata: ctx.accounts.recipient_ata.key(),
        rent: ctx.accounts.rent.key(),
        system_program: ctx.accounts.system_program.key(),
        task: ctx.accounts.task.key(),
        token_program: ctx.accounts.token_program.key(),
        clockwork_program: ctx.accounts.clockwork_program.key(),
        authority: ctx.accounts.authority.key(),
        token_mint: ctx.accounts.token_mint.key(),
        user_id: ctx.accounts.user_id.key(),
        thread: ctx.accounts.thread.key(),
    }
    .to_account_metas(None);

    let target_ix = Instruction {
        program_id: crate::ID,
        accounts: target_ix_acct,
        data: crate::instruction::ProcessTask {}.data(),
    };

    // let freq = ctx.accounts.task.freq.clone();
    // let skippable = ctx.accounts.task.skippable;

    // let trigger = Trigger::Cron {
    //     schedule: freq,
    //     skippable,
    // };

    let trigger = ctx.accounts.task.trigger.clone();

    clockwork_sdk::cpi::thread_create(
        ctx.accounts.into_start_task_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
        amount,
        ctx.accounts.task.label.clone(),
        vec![target_ix.into()],
        trigger.into(),
    )?;

    ctx.accounts.task.status = TaskStatus::Started;

    Ok(())
}
