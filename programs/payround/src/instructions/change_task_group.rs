use crate::constants::*;
use crate::error::ErrorCode;
use crate::state::{PayroundAccount, Task, TaskGroup, Tasklist};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ChangeTaskGroup<'info> {
    #[account(
      mut,
      constraint=task.task_group==current_task_group.key() @ ErrorCode::KeysDontMatch, // todo: error
      constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch,
    )]
    pub task: Box<Account<'info, Task>>,

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
      has_one=authority,
      constraint=current_task_group.account==payround_account.key() @ ErrorCode::KeysDontMatch,
      constraint=current_task_group.tasklist==current_group_tasklist.key() @ ErrorCode::KeysDontMatch
    )]
    pub current_task_group: Box<Account<'info, TaskGroup>>,

    #[account(
      mut,
      has_one=authority,
      constraint=new_task_group.account==payround_account.key() @ ErrorCode::KeysDontMatch,
      constraint=new_task_group.tasklist==new_group_tasklist.key() @ ErrorCode::KeysDontMatch
    )]
    pub new_task_group: Box<Account<'info, TaskGroup>>,

    #[account(mut)]
    pub current_group_tasklist: AccountLoader<'info, Tasklist>,

    #[account(mut)]
    pub new_group_tasklist: AccountLoader<'info, Tasklist>,

    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<ChangeTaskGroup>) -> Result<()> {
    let task_pubkey = ctx.accounts.task.key();
    let current_taskgroup_key = ctx.accounts.current_task_group.key();
    let new_taskgroup_key = ctx.accounts.new_task_group.key();

    let mut current_tasklist = ctx.accounts.current_group_tasklist.load_mut()?;
    let mut new_tasklist = ctx.accounts.new_group_tasklist.load_mut()?;

    current_tasklist.remove_task(task_pubkey)?;
    new_tasklist.add_task(task_pubkey)?;

    ctx.accounts
        .task
        .update_group(current_taskgroup_key, new_taskgroup_key);
    Ok(())
}
