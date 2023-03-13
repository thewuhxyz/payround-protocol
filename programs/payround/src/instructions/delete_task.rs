use anchor_lang::prelude::*;
use clockwork_sdk::state::{Thread, ThreadAccount};
use clockwork_sdk::ThreadProgram;

use crate::constants::PAYROUND_SEED;
use crate::error::ErrorCode;
use crate::state::{PayroundAccount, Task, 
    // TaskGroup, Tasklist
};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct DeleteTask<'info> {
    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      close=authority,
      has_one=authority,
    //   has_one=task_group,
      has_one=thread,
      constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub task:Box< Account<'info, Task>>,

    // #[account(has_one=tasklist)]
    // pub task_group: Account<'info, TaskGroup>,

    // #[account(mut)]
    // pub tasklist: AccountLoader<'info, Tasklist>,

    #[account(
        mut, 
        address=thread.pubkey(),
        constraint=thread.pubkey()==task.thread @ ErrorCode::KeysDontMatch, 
        constraint=thread.authority==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub thread: Box<Account<'info, Thread>>,

    /// CHECK: user_id
    pub user_id: AccountInfo<'info>,

    #[account(
        mut,
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,
 
}

impl<'info> DeleteTask<'info> {
    fn into_delete_thread_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadDelete<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadDelete {
            authority: self.payround_account.to_account_info(),
            thread: self.thread.to_account_info(),
            close_to: self.authority.to_account_info()
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<DeleteTask>) -> Result<()> {
    clockwork_sdk::cpi::thread_delete(
        ctx.accounts.into_delete_thread_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
    )?;
    
    // let task_pubkey = ctx.accounts.task.key();
    // let mut tasklist = ctx.accounts.tasklist.load_mut()?;
    // tasklist.remove_task(task_pubkey)?;

    Ok(())
}
