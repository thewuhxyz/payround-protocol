use anchor_lang::prelude::*;
use clockwork_sdk::{state::{Thread, ThreadAccount}, ThreadProgram};


use crate::{
    constants::PAYROUND_SEED,
    state::{PayroundAccount, Task},
    error::ErrorCode,
};

#[derive(Accounts)]
#[instruction(thread_label: String)]
pub struct WithdrawCredit<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      has_one=authority,
      has_one=thread,
      constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        address=thread.pubkey(),
        constraint=thread.pubkey()==task.thread @ ErrorCode::KeysDontMatch, 
        constraint=thread.authority==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub thread: Account<'info, Thread>,

    pub user_id: SystemAccount<'info>,

    #[account(
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Account<'info, PayroundAccount>,
}

impl<'info> WithdrawCredit<'info> {
    fn into_withdraw_credit_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadWithdraw<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadWithdraw {
            authority: self.payround_account.to_account_info(),
            thread: self.thread.to_account_info(),
            pay_to: self.authority.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<WithdrawCredit>, amount: u64) -> Result<()> {
    clockwork_sdk::cpi::thread_withdraw(
        ctx.accounts.into_withdraw_credit_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
        amount,
    )?;

    Ok(())
}
