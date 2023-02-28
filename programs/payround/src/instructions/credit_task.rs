use anchor_lang::system_program::Transfer;
use anchor_lang::{prelude::*, system_program};
use clockwork_sdk::state::{Thread, ThreadAccount};

use crate::state::{PayroundAccount, Task};
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct CreditTask<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        has_one=authority,
        has_one=thread,
        constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut, 
        address=thread.pubkey(),
        constraint=thread.pubkey()==task.thread @ ErrorCode::KeysDontMatch, 
        constraint=thread.authority==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub thread: Box<Account<'info, Thread>>,

    pub user_id: SystemAccount<'info>,

    #[account(
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> CreditTask<'info> {
    fn into_credit_task_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.authority.to_account_info(),
            to: self.thread.to_account_info(),
        };
        let cpi_program = self.system_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<CreditTask>, amount: u64) -> Result<()> {
    system_program::transfer(ctx.accounts.into_credit_task_context(), amount)?;

    Ok(())
}
