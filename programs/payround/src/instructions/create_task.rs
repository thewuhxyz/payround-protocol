use crate::{error::ErrorCode, state::TaskStatus};
use anchor_lang::prelude::*;

use crate::{
    constants::*,
    state::{PayroundAccount, Task, TaskGroup, Tasklist},
};

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer=authority,
        space=8+Task::LEN
    )]
    pub task: Account<'info, Task>,

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
    )]
    pub task_group: Account<'info, TaskGroup>,

    #[account(mut)]
    pub tasklist: AccountLoader<'info, Tasklist>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(address = anchor_lang::system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateTask>, amount: u64, desc: String, freq: String, skippable: bool) -> Result<()> {
    if desc.len() > MAX_DESC_CHAR {
        return err!(ErrorCode::MaxDescLenghtExceeded);
    }

    let task_pubkey = ctx.accounts.task.key();

    ctx.accounts.task.new(
        amount,
        task_pubkey,
        ctx.accounts.task_group.key(),
        ctx.accounts.payround_account.key(),
        ctx.accounts.authority.key(),
        ctx.accounts.recipient.key(),
        desc,
        freq,
        skippable
    );

    ctx.accounts.task.status = TaskStatus::NOTSTARTED;

    let mut tasklist = ctx.accounts.tasklist.load_mut()?;
    tasklist.add_task(task_pubkey)?;

    Ok(())
}
