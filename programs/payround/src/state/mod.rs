use anchor_lang::prelude::*;

#[account]
pub struct EmailAccount {
  pub usdc_token_account: Pubkey,
  pub authority: Pubkey,
  pub pubkey: Pubkey,
  pub user_id: String,
}

#[account]
pub struct DegenAccount {
  pub usdc_token_account: Pubkey,
  pub authority: Pubkey,
  pub pubkey: Pubkey,
}