use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer, Mint},
};
use crate::{
    constants::PAYROUND_SEED,
    state::{PayroundAccount},
    // error::ErrorCode,
};

#[derive(Accounts)]
pub struct MakeTransfer<'info> {

    #[account(mut)]
    pub authority: Signer<'info>,

    pub user_id: SystemAccount<'info>,

    #[account(
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,


    #[account(
        mut,
        associated_token::mint=token_mint,
        associated_token::authority = payround_account,
    )]
    pub account_ata: Box<Account<'info, TokenAccount>>,

    /// CHECK: recipient account
    pub recipient: AccountInfo<'info>,

    #[account(
        // mut,
        init_if_needed,
        associated_token::mint=token_mint,
        associated_token::authority = recipient,
        payer=authority,
    )]
    pub recipient_ata: Box<Account<'info, TokenAccount>>,
    
    pub token_mint: Box<Account<'info, Mint>>,
   
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = anchor_spl::associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    #[account(address = anchor_lang::system_program::ID)]
    pub system_program: Program<'info, System>,

}

impl<'info> MakeTransfer<'info> {
    fn into_make_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.account_ata.to_account_info().clone(),
            to: self.recipient_ata.to_account_info().clone(),
            authority: self.payround_account.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<MakeTransfer>, amount: u64) -> Result<()> {

    let (_, bump) = Pubkey::find_program_address(
        &[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED,
        ],
        ctx.program_id,
    );
    token::transfer(
        ctx.accounts.into_make_transfer_context().with_signer(&[&[
            ctx.accounts.payround_account.user_id.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[bump],
        ]]),
        amount,
    )?;
    Ok(())
}
