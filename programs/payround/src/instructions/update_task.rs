use anchor_lang::prelude::*;

use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
pub struct UpdateTaskAmount<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,

    #[account(has_one=authority)]
    pub payround_account: Account<'info, PayroundAccount>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateTaskAmount>, amount: u64) -> Result<()> {
    ctx.accounts.task.update_amount(amount);

    Ok(())
}
