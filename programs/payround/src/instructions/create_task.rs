use anchor_lang::prelude::*;

use crate::state::{PayroundAccount, Task, TaskGroup, Tasklist};

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
    init,
    payer=payer,
    space=512+8
  )]
    pub task: Account<'info, Task>,

    #[account(has_one=authority)]
    pub payround_account: Account<'info, PayroundAccount>,

    #[account(
    mut,
    has_one=authority,
  )]
    pub task_group: Account<'info, TaskGroup>,

    #[account(mut)]
    pub tasklist: AccountLoader<'info, Tasklist>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateTask>, amount: u64, label: String, desc: String) -> Result<()> {
    let task_pubkey = ctx.accounts.task.key();

    ctx.accounts.task.new(
        amount,
        task_pubkey,
        ctx.accounts.task_group.key(),
        ctx.accounts.payround_account.key(),
        ctx.accounts.authority.key(),
        ctx.accounts.recipient.key(),
        label,
        desc,
    );

    let mut tasklist = ctx.accounts.tasklist.load_mut()?;
    tasklist.add_task(task_pubkey);

    Ok(())
}
