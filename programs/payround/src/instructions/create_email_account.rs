use anchor_lang::{prelude::*};
use anchor_spl::token::{TokenAccount, Mint, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::EmailAccount;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(user_id: String)]
pub struct CreateEmailAccount <'info> {  
  #[account(
    init,
    seeds=[user_id.as_ref(), EMAIL_SEED.as_ref()],
    bump,
    payer=payer, 
    space=512+8
  )]
  pub email_account: Account<'info, EmailAccount>,
  
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    payer=payer,
    associated_token::mint=token_mint,
    associated_token::authority = email_account,
  )]
  pub usdc_token_account: Account<'info, TokenAccount>,
  
  pub token_mint: Account<'info, Mint>,

  pub authority: Signer<'info>,

  pub token_program: Program<'info, Token>,

  pub associated_token_program: Program<'info, AssociatedToken>,
  
  pub system_program: Program<'info, System>

}

pub fn handler (ctx: Context<CreateEmailAccount>, user_id: String) -> Result<()> {
  ctx.accounts.email_account.authority = ctx.accounts.authority.key();
  ctx.accounts.email_account.usdc_token_account = ctx.accounts.usdc_token_account.key();
  ctx.accounts.email_account.user_id = user_id;
  ctx.accounts.email_account.pubkey = ctx.accounts.email_account.key();
  Ok(())
}

