use anchor_lang::prelude::*;
use clockwork_sdk::state::Thread;
use clockwork_sdk::ThreadProgram;

use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
#[instruction(thread_label: String)]
pub struct WithdrawCredit<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    pub task: Account<'info, Task>,

    /// Who's paying
    #[account(mut)]
    pub pay_to: SystemAccount<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key(), task.key()))]
    #[account(mut)]
    pub thread: Account<'info, Thread>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Account<'info, PayroundAccount>, // * will be the thread authority
}

impl<'info> WithdrawCredit<'info> {
    fn into_withdraw_credit_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadWithdraw<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadWithdraw {
            authority: self.payround_account.to_account_info(),
            thread: self.thread.to_account_info(),
            pay_to: self.pay_to.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<WithdrawCredit>, amount: u64) -> Result<()> {
    clockwork_sdk::cpi::thread_withdraw(
        ctx.accounts.into_withdraw_credit_context().with_signer(&[&[
            ctx.accounts.payround_account.authority.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
        amount,
    )?;

    Ok(())
}
