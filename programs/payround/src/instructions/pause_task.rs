use anchor_lang::prelude::*;
use clockwork_sdk::state::{Thread, ThreadAccount};
use clockwork_sdk::ThreadProgram;

use crate::error::ErrorCode;
use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task, TaskStatus};

#[derive(Accounts)]
pub struct PauseTask<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

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
        mut,
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,

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
        ctx.accounts.payround_account.user_id.key().as_ref(),
        PAYROUND_SEED.as_ref(),
        &[ctx.accounts.payround_account.bump],
    ]]))?;

    ctx.accounts.task.status = TaskStatus::PAUSED;

    Ok(())
}
