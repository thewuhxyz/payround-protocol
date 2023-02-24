use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};
// use clockwork_sdk::state::{ Thread, ThreadAccount };

use crate::{
    constants::DEGEN_SEED,
    state::{DegenAccount, Task},
};

#[derive(Accounts)]
pub struct ProcessTaskTest<'info> {
    pub task: Account<'info, Task>,

    pub thread_authority: Signer<'info>,

    // #[account(signer, address = thread.pubkey())]
    // pub thread: Account<'info, Thread>,

    pub degen_account: Account<'info, DegenAccount>,

    #[account(mut)]
    pub account_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub rent: Sysvar<'info, Rent>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

impl<'info> ProcessTaskTest<'info> {
    fn into_process_task_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.account_ata.to_account_info().clone(),
            to: self.recipient_ata.to_account_info().clone(),
            authority: self.degen_account.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<ProcessTaskTest>) -> Result<()> {
    let (_, bump) = Pubkey::find_program_address(
        &[ctx.accounts.degen_account.authority.key().as_ref(), DEGEN_SEED],
        ctx.program_id,
    );
    token::transfer(
        ctx.accounts.into_process_task_context().with_signer(&[&[
            ctx.accounts.degen_account.authority.key().as_ref(),
            DEGEN_SEED.as_ref(),
            &[bump],
        ]]),
        ctx.accounts.task.amount,
    )?;
    Ok(())
}
