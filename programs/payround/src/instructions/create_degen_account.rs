use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{PayroundAccount, TaskGroup, Tasklist};
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct CreateDegenAccount <'info> {  
  #[account(
    init,
    seeds=[authority.key().as_ref(), PAYROUND_SEED.as_ref()],
    bump,
    payer=authority, 
    space=8+PayroundAccount::LEN
  )]
  pub payround_account: Account<'info, PayroundAccount>,

  #[account(
    init,
    payer=authority,
    associated_token::mint=token_mint,
    associated_token::authority = payround_account,
  )]
  pub usdc_token_account: Account<'info, TokenAccount>,

  #[account(
    init,
    payer=authority,
    space=8+TaskGroup::LEN
  )]
  pub default_group: Account<'info, TaskGroup>,

  #[account(zero)]
  pub tasklist: AccountLoader<'info, Tasklist>,
  
  pub token_mint: Account<'info, Mint>,

  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(address = anchor_spl::token::ID)]
  pub token_program: Program<'info, Token>,

    #[account(address = anchor_spl::associated_token::ID)]
  pub associated_token_program: Program<'info, AssociatedToken>,
  
  #[account(address = anchor_lang::system_program::ID)]
  pub system_program: Program<'info, System>,

}

pub fn handler (ctx: Context<CreateDegenAccount>, bump: u8, desc: String) -> Result<()> {

  if desc.len() > MAX_DESC_CHAR {
    return err!(ErrorCode::MaxDescLenghtExceeded)
  }

  let account_key = ctx.accounts.payround_account.key();

  let group_key = ctx.accounts.default_group.key();
  let tasklist_key = ctx.accounts.tasklist.key();

  ctx.accounts.default_group.init(
        group_key,
        ctx.accounts.authority.key(),
        ctx.accounts.payround_account.key(),
        tasklist_key,
        desc,
    );

    let mut tasklist = ctx.accounts.tasklist.load_init()?;
    tasklist.init(group_key);

  ctx.accounts.payround_account.init(
    account_key,
    ctx.accounts.authority.key(),
    ctx.accounts.authority.key(),
    ctx.accounts.usdc_token_account.key(),
    group_key,
    bump,
    false
  )?;
  Ok(())
}

