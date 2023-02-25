use anchor_lang::prelude::*;

use crate::state::{PayroundAccount, TaskGroup, Tasklist};

#[derive(Accounts)]
pub struct CreateTaskGroup<'info> {
    #[account(
    init,
    payer=payer,
    space=512+8
  )]
    pub task_group: Account<'info, TaskGroup>,

    pub authority: Signer<'info>,

    pub payround_account: Account<'info, PayroundAccount>,

    #[account(zero)]
    pub tasklist: AccountLoader<'info, Tasklist>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateTaskGroup>, desc: String) -> Result<()> {
    let task_group_key = ctx.accounts.task_group.key();
    let tasklist_key = ctx.accounts.tasklist.key();

    ctx.accounts.task_group.init(
        task_group_key,
        ctx.accounts.authority.key(),
        ctx.accounts.payround_account.key(),
        tasklist_key,
        desc,
    );

    let mut tasklist = ctx.accounts.tasklist.load_init()?;
    tasklist.init(task_group_key);

    Ok(())
}
