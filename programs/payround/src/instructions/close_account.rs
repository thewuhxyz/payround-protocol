use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::constants::*;
use crate::state::PayroundAccount;

#[derive(Accounts)]
pub struct ClosePayroundAccount<'info> {
    #[account(
    mut,
    seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
    bump=payround_account.bump,
    has_one=user_id,
    has_one=authority,
    close=authority
  )]
    pub payround_account: Account<'info, PayroundAccount>,

    /// CHECK: user id
    pub user_id: AccountInfo<'info>,

    #[account(
    mut,
    close=authority,
    associated_token::mint=token_mint,
    associated_token::authority = payround_account,
    constraint=usdc_token_account.amount <= 0
  )]
    pub usdc_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = anchor_lang::system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<ClosePayroundAccount>) -> Result<()> {
    Ok(())
}
