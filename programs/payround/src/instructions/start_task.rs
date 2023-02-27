use anchor_lang::{prelude::*, InstructionData};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount};
use clockwork_sdk::state::Trigger;
use clockwork_sdk::ThreadProgram;
use solana_program::instruction::Instruction;

use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct StartTask<'info> {
    pub system_program: Program<'info, System>,

    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    pub task: Box<Account<'info, Task>>,

    /// Who's paying
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key()]
    #[account(mut)]
    pub thread: SystemAccount<'info>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Box<Account<'info, PayroundAccount>>, // * will be the thread authority

    #[account(mut)]
    pub account_ata: Box<Account<'info, TokenAccount>>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_ata: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub rent: Sysvar<'info, Rent>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> StartTask<'info> {
    fn into_start_task_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadCreate<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadCreate {
            authority: self.payround_account.to_account_info(),
            payer: self.payer.to_account_info(),
            system_program: self.system_program.to_account_info(),
            thread: self.thread.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<StartTask>, schedule: String, skippable: bool) -> Result<()> {
    let mut target_ix_acct = crate::accounts::ProcessTask {
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
        thread: ctx.accounts.thread.key(),
    }
    .to_account_metas(Some(false));

    let signer_thread = ctx.accounts.thread.to_account_metas(Some(true))[0].clone();

    let index = target_ix_acct.iter().position(|x| x.pubkey == signer_thread.pubkey).unwrap();
    target_ix_acct.remove(index);
    target_ix_acct.push(signer_thread);

    // msg!("{:#?}", target_ix_acct);

    let target_ix = Instruction {
        program_id: crate::ID,
        accounts: target_ix_acct,
        data: crate::instruction::ProcessTask{}.data(),
    };

    // msg!("{:#?}", target_ix);

    let trigger = Trigger::Cron {
        schedule,
        skippable,
    };

    clockwork_sdk::cpi::thread_create(
        ctx.accounts.into_start_task_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
        ctx.accounts.task.label.clone(),
        target_ix.into(),
        trigger,
    )?;

    Ok(())
}
