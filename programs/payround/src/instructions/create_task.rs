use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};

use crate::state::{Task, DegenAccount, TaskGroup, Tasklist};

#[derive(Accounts)]
pub struct CreateTask <'info> {
  #[account(
    init,
    payer=payer,
    space=512+8
  )]
  pub task: Account<'info, Task>,

  #[account(has_one=authority)]
  pub degen_account: Account<'info, DegenAccount>,

  #[account(
    mut,
    has_one=authority,
  )]
  pub task_group: Account<'info, TaskGroup>,

  #[account(mut)]
  pub tasklist: AccountLoader<'info, Tasklist>,
  
  #[account(mut)]
  pub payer: Signer<'info>,

  pub recipient_ata: Account<'info, TokenAccount>,

  pub authority: Signer<'info>,

  pub system_program: Program<'info, System>
}

pub fn handler(ctx: Context<CreateTask>, amount: u64, desc: String,) -> Result<()> {
  let task_pubkey = ctx.accounts.task.key();

  ctx.accounts.task.new(
    amount, 
    task_pubkey, 
    ctx.accounts.task_group.key(),
    ctx.accounts.degen_account.key(), 
    ctx.accounts.authority.key(), 
    ctx.accounts.recipient_ata.key(), 
    desc);

  let mut tasklist = ctx.accounts.tasklist.load_mut()?;
  tasklist.add_task(task_pubkey);

  Ok(())
} 