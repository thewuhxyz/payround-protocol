use anchor_lang::prelude::*;
use clockwork_sdk::state::Thread;
use clockwork_sdk::ThreadProgram;

use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct PauseTask<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    pub task: Account<'info, Task>,

    /// Who's paying
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key(), task.key()))]
    #[account(mut)]
    pub thread: Account<'info, Thread>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Account<'info, PayroundAccount>, // * will be the thread authority
}

impl<'info> PauseTask<'info> {
    fn into_pause_task_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadPause<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadPause {
            authority: self.payround_account.to_account_info(),
            thread: self.thread.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<PauseTask>) -> Result<()> {
    clockwork_sdk::cpi::thread_pause(ctx.accounts.into_pause_task_context().with_signer(&[&[
        ctx.accounts.payround_account.authority.key().as_ref(),
        PAYROUND_SEED.as_ref(),
        &[ctx.accounts.payround_account.bump],
    ]]))?;

    Ok(())
}
