use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::{PayroundAccount, Task, TaskGroup, Tasklist};

#[derive(Accounts)]
pub struct ChangeTaskGroup<'info> {
    #[account(
    init,
    payer=payer,
    space=512+8
  )]
    pub task: Box<Account<'info, Task>>,

    #[account(has_one=authority)]
    pub payround_account: Box<Account<'info, PayroundAccount>>,

    #[account(
    mut,
    has_one=authority,
  )]
    pub current_task_group: Box<Account<'info, TaskGroup>>,

    #[account(
    mut,
    has_one=authority,
  )]
    pub new_task_group: Box<Account<'info, TaskGroup>>,

    #[account(mut)]
    pub current_group_tasklist: AccountLoader<'info, Tasklist>,

    #[account(mut)]
    pub new_group_tasklist: AccountLoader<'info, Tasklist>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub recipient_ata: Box<Account<'info, TokenAccount>>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ChangeTaskGroup>) -> Result<()> {
    let task_pubkey = ctx.accounts.task.key();
    let current_taskgroup_key = ctx.accounts.current_task_group.key();
    let new_taskgroup_key = ctx.accounts.new_task_group.key();

    let mut current_tasklist = ctx.accounts.current_group_tasklist.load_mut()?;
    let mut new_tasklist = ctx.accounts.new_group_tasklist.load_mut()?;

    current_tasklist.remove_task(task_pubkey);
    new_tasklist.add_task(task_pubkey);

    ctx.accounts
        .task
        .update_group(current_taskgroup_key, new_taskgroup_key);
    Ok(())
}
