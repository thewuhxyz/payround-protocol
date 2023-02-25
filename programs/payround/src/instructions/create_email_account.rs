use anchor_lang::{prelude::*};
use anchor_spl::token::{TokenAccount, Mint, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::PayroundAccount;
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateEmailAccount <'info> {  
  #[account(
    init,
    seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
    bump,
    payer=admin, 
    space=512+8
  )]
  pub email_account: Account<'info, PayroundAccount>,
  
  // hardcode static signer
  #[account(mut)]
  pub admin: Signer<'info>, 

  pub user_id: SystemAccount<'info>,


  #[account(
    init,
    payer=admin,
    associated_token::mint=token_mint,
    associated_token::authority = email_account,
  )]
  pub usdc_token_account: Account<'info, TokenAccount>,
  
  pub token_mint: Account<'info, Mint>,

  pub token_program: Program<'info, Token>,

  pub associated_token_program: Program<'info, AssociatedToken>,
  
  pub system_program: Program<'info, System>

}

pub fn handler (ctx: Context<CreateEmailAccount>, bump: u8) -> Result<()> {

  let account_key = ctx.accounts.email_account.key();
  ctx.accounts.email_account.init(
    account_key,
    ctx.accounts.admin.key(),
    ctx.accounts.user_id.key(),
    ctx.accounts.usdc_token_account.key(),
    bump,
    true
  );
  Ok(())
}

