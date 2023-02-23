use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Token, Transfer, self}, associated_token::AssociatedToken};
use clockwork_sdk::state::{Thread, ThreadResponse, ThreadAccount};

use crate::{state::{Task, DegenAccount}, constants::DEGEN_SEED};

#[derive(Accounts)]
pub struct ProcessTask <'info> {
  pub task: Account<'info, Task>,

  pub thread_authority: Signer<'info>,

  #[account(signer, address = thread.pubkey())]
  pub thread: Account<'info, Thread>,

  pub degen_account: Account<'info, DegenAccount>,
  
  #[account(mut)]
  pub account_ata: Account<'info, TokenAccount>,

  #[account(mut)]
  pub recipient_ata: Account<'info, TokenAccount>,

  pub token_program: Program<'info, Token>,

  pub associated_token_program: Program<'info, AssociatedToken>,

  pub system_program: Program<'info, System>,
}

impl<'info> ProcessTask<'info> {
    fn into_process_task_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.account_ata.to_account_info().clone(),
            to: self.recipient_ata.to_account_info().clone(),
            authority: self.degen_account.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler (ctx: Context<ProcessTask>) -> Result<ThreadResponse> {
  token::transfer(
    ctx.accounts.into_process_task_context()
    .with_signer(&[&[
                ctx.accounts.degen_account.authority.key().as_ref(),
                DEGEN_SEED.as_ref(),
                &[ctx.accounts.degen_account.bump],
            ]]), 
    ctx.accounts.task.amount
  )?;
  Ok(ThreadResponse::default())
}