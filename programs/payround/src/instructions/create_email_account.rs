use anchor_lang::{prelude::*};
use anchor_spl::token::{TokenAccount, Mint, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{PayroundAccount, TaskGroup, Tasklist};
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateEmailAccount <'info> {  
  #[account(
    init,
    seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
    bump,
    payer=payer, 
    space=512+8
  )]
  pub email_account: Account<'info, PayroundAccount>,
  
  // hardcode static signer
  pub authority: Signer<'info>, 
  
  pub user_id: SystemAccount<'info>,

  #[account(
    init,
    payer=payer,
    space=512+8
  )]
  pub default_group: Account<'info, TaskGroup>,

  #[account(zero)]
    pub tasklist: AccountLoader<'info, Tasklist>,
  
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

  pub token_program: Program<'info, Token>,

  pub associated_token_program: Program<'info, AssociatedToken>,
  
  pub system_program: Program<'info, System>

}

pub fn handler (ctx: Context<CreateEmailAccount>, bump: u8, desc: String) -> Result<()> {
   let group_key = ctx.accounts.default_group.key();
  let tasklist_key = ctx.accounts.tasklist.key();


   ctx.accounts.default_group.init(
        group_key,
        ctx.accounts.authority.key(),
        ctx.accounts.email_account.key(),
        tasklist_key,
        desc,
    );

    let mut tasklist = ctx.accounts.tasklist.load_init()?;
    tasklist.init(group_key);

  let account_key = ctx.accounts.email_account.key();
  ctx.accounts.email_account.init(
    account_key,
    ctx.accounts.authority.key(),
    ctx.accounts.user_id.key(),
    ctx.accounts.usdc_token_account.key(),
    group_key,
    bump,
    true
  );

  Ok(())
}

