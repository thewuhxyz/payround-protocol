use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::constants::*;
use crate::state::PayroundAccount;

#[derive(Accounts)]
pub struct ClosePayroundAccount<'info> {
    #[account(
    mut,
    seeds=[payround_account.user_id.as_ref(), PAYROUND_SEED.as_ref()],
    bump,
    has_one=authority,
    close=authority
  )]
    pub payround_account: Account<'info, PayroundAccount>,

    #[account(
    associated_token::mint=token_mint,
    associated_token::authority = payround_account,
    constraint=usdc_token_account.amount <= 0
  )]
    pub usdc_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<ClosePayroundAccount>) -> Result<()> {
    Ok(())
}
