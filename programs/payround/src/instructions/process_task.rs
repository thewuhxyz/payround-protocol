use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};
use clockwork_sdk::{state::{Thread, ThreadAccount, ThreadResponse}, ThreadProgram};

use crate::{
    constants::PAYROUND_SEED,
    state::{PayroundAccount, Task},
};

#[derive(Accounts)]
pub struct ProcessTask<'info> {
    pub task: Account<'info, Task>,

    pub payround_account: Box<Account<'info, PayroundAccount>>,

    #[account(mut)]
    pub account_ata: Box<Account<'info, TokenAccount>>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_ata: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub rent: Sysvar<'info, Rent>,

    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    #[account(mut, signer, address = thread.pubkey())]
    pub thread: Box<Account<'info, Thread>>,
}

impl<'info> ProcessTask<'info> {
    fn into_process_task_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.account_ata.to_account_info().clone(),
            to: self.recipient_ata.to_account_info().clone(),
            authority: self.payround_account.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<ProcessTask>) -> Result<ThreadResponse> {

    let (_, bump) = Pubkey::find_program_address(
        &[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED,
        ],
        ctx.program_id,
    );
    token::transfer(
        ctx.accounts.into_process_task_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[bump],
        ]]),
        ctx.accounts.task.amount,
    )?;
    Ok(ThreadResponse::default())
}
