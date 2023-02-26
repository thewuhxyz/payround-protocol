use anchor_lang::prelude::*;
use clockwork_sdk::state::Thread;
use clockwork_sdk::ThreadProgram;

use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task, TaskGroup, Tasklist};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct DeleteTask<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    #[account(
      mut,
      close=pay_to,
      has_one=authority
    )]
    pub task:Box< Account<'info, Task>>,

    pub task_group: Account<'info, TaskGroup>,

    #[account(mut)]
    pub tasklist: AccountLoader<'info, Tasklist>,

    /// Who's paying
    #[account(mut)]
    pub pay_to: SystemAccount<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key(), task.key()))]
    #[account(mut)]
    pub thread: Box<Account<'info, Thread>>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Box<Account<'info, PayroundAccount>>, // * will be the thread authority
}

impl<'info> DeleteTask<'info> {
    fn into_delete_thread_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadDelete<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadDelete {
            authority: self.payround_account.to_account_info(),
            thread: self.thread.to_account_info(),
            close_to: self.pay_to.to_account_info()
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<DeleteTask>) -> Result<()> {
    clockwork_sdk::cpi::thread_delete(
        ctx.accounts.into_delete_thread_context().with_signer(&[&[
            ctx.accounts.payround_account.authority.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
    )?;
    
    let task_pubkey = ctx.accounts.task.key();
    let mut tasklist = ctx.accounts.tasklist.load_mut()?;
    tasklist.add_task(task_pubkey);

    Ok(())
}
