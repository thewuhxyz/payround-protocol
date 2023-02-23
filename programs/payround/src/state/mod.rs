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
    // pub account_type: AccountType
    pub email: bool,
    pub bump: u8
}

pub enum AccountType {
  DEGEN = 0,
  EMAIL = 1,
}

#[account]
pub struct Task {
    pub pubkey: Pubkey,
    pub task_group: Pubkey,
    pub account: Pubkey, // email or degen
    pub authority: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub desc: String,
    // pub frequency: String, // the frequency of the task
    // pub start: String, // when the task is to start
    // pub stop: String, // when the task is to stop
    // pub desc: String, // description of the task
}

impl Task {
    pub fn new(
        &mut self,
        ammount: u64,
        pubkey: Pubkey,
        task_group_key: Pubkey,
        account: Pubkey,
        authority: Pubkey,
        recipient_ata: Pubkey,
        desc: String,
    ) {
        self.amount = ammount;
        self.pubkey = pubkey;
        self.task_group = task_group_key;
        self.authority = authority;
        self.recipient = recipient_ata;
        self.account = account;
        self.desc = desc;
    }
}

#[account]
pub struct TaskGroup {
    pub pubkey: Pubkey,
    pub authority: Pubkey,
    pub account: Pubkey,
    pub desc: String,
    pub tasklist: Pubkey,
}

impl TaskGroup {
  pub fn init (&mut self, pubkey: Pubkey, authority: Pubkey, account: Pubkey, tasklist: Pubkey, desc: String ) {
    self.pubkey = pubkey;
    self.authority = authority;
    self.account = account;
    self.tasklist = tasklist;
    self.desc = desc;
  }
}

#[account(zero_copy)]
pub struct Tasklist {
    pub task_group: Pubkey,
    pub count: u32,
    pub max: u32,
    pub list: [Pubkey; 100],
}

impl Tasklist {
  pub fn init (&mut self, task_group_key: Pubkey) {
    self.task_group = task_group_key;
    self.count = 0;
    self.list = [Pubkey::default(); 100]
  }

  pub fn add_task (&mut self, task: Pubkey) {
    self.list[self.count as usize] = task;
    self.count = self.count + 1
  }
}
