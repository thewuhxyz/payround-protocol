use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::PayroundAccount;
use crate::constants::*;

#[derive(Accounts)]
// #[instruction(user_id: String)]
pub struct CreateDegenAccount <'info> {  
  #[account(
    init,
    seeds=[authority.key().as_ref(), PAYROUND_SEED.as_ref()],
    bump,
    payer=payer, 
    space=512+8
  )]
  pub payround_account: Account<'info, PayroundAccount>,

  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    payer=payer,
    associated_token::mint=token_mint,
    associated_token::authority = payround_account,
  )]
  pub usdc_token_account: Account<'info, TokenAccount>,
  
  pub token_mint: Account<'info, Mint>,

  pub authority: Signer<'info>,

  pub token_program: Program<'info, Token>,

  pub associated_token_program: Program<'info, AssociatedToken>,
  
  pub system_program: Program<'info, System>

}

pub fn handler (ctx: Context<CreateDegenAccount>, bump: u8) -> Result<()> {

  let account_key = ctx.accounts.payround_account.key();

  ctx.accounts.payround_account.init(
    account_key,
    ctx.accounts.authority.key(),
    ctx.accounts.authority.key(),
    ctx.accounts.usdc_token_account.key(),
    bump,
    false
  );
  Ok(())
}

