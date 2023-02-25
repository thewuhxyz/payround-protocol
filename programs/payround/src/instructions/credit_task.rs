use anchor_lang::system_program::Transfer;
use anchor_lang::{prelude::*, system_program};
use clockwork_sdk::state::Thread;

use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
pub struct CreditTask<'info> {
    pub authority: Signer<'info>,

    pub task: Account<'info, Task>,

    /// Who's paying
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key(), task.key()))]
    #[account(mut)]
    pub thread: Account<'info, Thread>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Account<'info, PayroundAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreditTask<'info> {
    fn into_credit_task_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.payer.to_account_info(),
            to: self.task.to_account_info(),
        };
        let cpi_program = self.system_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<CreditTask>, amount: u64) -> Result<()> {
    system_program::transfer(ctx.accounts.into_credit_task_context(), amount)?;

    Ok(())
}
