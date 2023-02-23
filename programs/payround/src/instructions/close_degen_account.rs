use anchor_lang::{prelude::*};
use anchor_spl::token::{TokenAccount, Mint, Token};

use crate::state::DegenAccount;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(user_id: String)]
pub struct CloseDegenAccount <'info> {  
  #[account(
    mut,
    seeds=[user_id.as_ref(), DEGEN_SEED.as_ref()],
    bump,
    has_one=authority,
    close=authority
  )]
  pub degen_account: Account<'info, DegenAccount>,

  #[account(
    associated_token::mint=token_mint,
    associated_token::authority = degen_account,
    constraint=usdc_token_account.amount <= 0
  )]
  pub usdc_token_account: Account<'info, TokenAccount>,
  
  pub token_mint: Account<'info, Mint>,

  #[account(mut)]
  pub authority: Signer<'info>,

  pub token_program: Program<'info, Token>,
  
  pub system_program: Program<'info, System>

}

pub fn handler (_ctx: Context<CloseDegenAccount>) -> Result<()> {
  Ok(())
}
