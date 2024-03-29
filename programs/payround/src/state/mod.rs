use anchor_lang::prelude::*;

use crate::constants::{SEED_THREAD, MAX_TASK };
use crate::error::ErrorCode;

#[account]
pub struct PayroundAccount {
    pub pubkey: Pubkey, //32
    pub authority: Pubkey, //32
    pub user_id: Pubkey, // 32
    pub usdc_token_account: Pubkey, // 32
    // pub max_group: u8, // 1
    // pub group_count: u8, // 1
    pub email: bool, // 1
    pub bump: u8, // 1
    // pub task_groups: Vec<Pubkey>, // 24 + 32*32
}

impl PayroundAccount {
    pub const LEN:usize = 32 + 32 + 32 +32 + 1 + 1+ 1+ 1 + 24 + 32*32;

    pub fn init(
        &mut self,
        pubkey: Pubkey,
        authority: Pubkey,
        user_id: Pubkey,
        usdc_token_key: Pubkey,
        // group_key: Pubkey,
        bump: u8,
        email: bool,
    ) -> Result<()> {
        self.pubkey = pubkey;
        self.authority = authority;
        self.user_id = user_id;
        self.usdc_token_account = usdc_token_key;
        self.bump = bump;
        self.email = email;
        // self.task_groups = Vec::with_capacity(32);
        // self.max_group = MAX_GROUP as u8;
        // self.group_count = 0;
        // self.add_group(group_key)?;
        Ok(())
    }

    // pub fn add_group(&mut self, group_key: Pubkey) -> Result<()> {
    //     if self.group_count >= self.max_group {
    //         return err!(ErrorCode::MaxLimitReached)
    //     }
    //     self.task_groups.push(group_key);
    //     self.group_count = self.group_count.checked_add(1).unwrap();
    //     Ok(())
    // }

    // pub fn remove_group(&mut self, group_key: Pubkey) -> Result<()> {
    //     let index = self.task_groups.iter().position(|&x| x == group_key).unwrap();
    //     self.task_groups.remove(index);
    //     self.group_count = self.group_count.checked_sub(1).unwrap();
    //     Ok(())
    // }
}

// #[derive(AnchorSerialize, AnchorDeserialize)]
// pub struct Schedule {
//     pub freq: String,
//     pub skippable: bool
// }

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TaskOptions {
    pub amount: Option<u64>,
    pub schedule_options: Option<ClockworkTrigger>
}

#[account]
pub struct Task {
    pub pubkey: Pubkey, // 32
    pub task_group: Pubkey, // 32
    pub account: Pubkey, // 32
    pub authority: Pubkey, // 32
    pub recipient: Pubkey, // 32
    pub thread: Pubkey, // 32
    pub bump: u8, // 1
    pub amount: u64, // 8
    pub trigger: ClockworkTrigger,
    pub status: TaskStatus, // 1+1
    pub label: Vec<u8>, // 4 + 32
    // pub desc: String, // 4 + 32
    // pub skippable: bool, // 1
    // pub freq: String,  // 100
}

impl Task {
    pub const LEN:usize = 32 + 32 + 32 +32 + 32 + 32 + 1 + 8 + 1+ (1+1) + (4*32) + (4*32) + 100 ;

    pub fn new(
        &mut self,
        ammount: u64,
        pubkey: Pubkey,
        // task_group_key: Pubkey,
        account: Pubkey,
        authority: Pubkey,
        recipient: Pubkey,
        // desc: String,
        // freq: String,
        // skippable: bool
        trigger: ClockworkTrigger
    ) {
        self.amount = ammount;
        self.pubkey = pubkey;
        // self.task_group = task_group_key;
        self.authority = authority;
        self.recipient = recipient;
        self.account = account;
        // self.desc = desc;
        self.trigger = trigger;
        // self.freq = freq;
        // self.skippable = skippable;
        
        let task_key_str = bs58::encode(self.pubkey).into_string();
        self.label = task_key_str.split_at(10).0.to_string().try_to_vec().unwrap();
        
        (self.thread, self.bump) = Pubkey::find_program_address(
            &[SEED_THREAD, account.as_ref(), self.label.as_ref()],
            &clockwork_sdk::ID,
        );
    }

    pub fn update_amount(&mut self, amount: u64) {
        self.amount = amount
    }

    pub fn update_group(&mut self, current_group_key: Pubkey, new_group_key: Pubkey) {
        if self.task_group == current_group_key {
            self.task_group = new_group_key
        }
    }

    pub fn update_trigger(&mut self, trigger: ClockworkTrigger) {
        self.trigger = trigger;
    }
}


// #[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, Debug, PartialEq, Eq)]
// pub enum TriggerType {
//     CRON = 0,
//     INTERVAL = 1,
// };


#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, PartialEq)]
pub enum ClockworkTrigger {
    /// Allows a thread to be kicked off whenever the data of an account changes.
    Account {
        /// The address of the account to monitor.
        address: Pubkey,
        /// The byte offset of the account data to monitor.
        offset: u64,
        /// The size of the byte slice to monitor (must be less than 1kb)
        size: u64,
    },

    /// Allows an thread to be kicked off according to a one-time or recurring schedule.
    Cron {
        /// The schedule in cron syntax. Value must be parsable by the `clockwork_cron` package.
        schedule: String,

        /// Boolean value indicating whether triggering moments may be skipped if they are missed (e.g. due to network downtime).
        /// If false, any "missed" triggering moments will simply be executed as soon as the network comes back online.
        skippable: bool,
    },

    /// Allows an thread to be kicked off as soon as it's created.
    Now,

    /// Allows a thread to be kicked off according to a slot.
    Slot { slot: u64 },

    /// Allows a thread to be kicked off according to an epoch number.
    Epoch { epoch: u64 },
}

impl From<ClockworkTrigger> for clockwork_sdk::state::Trigger {
    fn from(x: ClockworkTrigger) -> Self {
        match x {
            ClockworkTrigger::Cron { schedule, skippable } => Self::Cron { schedule, skippable},
            ClockworkTrigger::Account { address, offset, size } => Self::Account { address, offset, size },
            ClockworkTrigger::Epoch { epoch } => Self::Epoch { epoch },
            ClockworkTrigger::Now => Self::Now,
            ClockworkTrigger::Slot { slot } => Self::Slot { slot },         
        }
    }
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum TaskStatus {
    Notstarted,
    Started,
    Paused,
    Ended,
}

#[account]
pub struct TaskGroup {
    pub pubkey: Pubkey, // 32
    pub authority: Pubkey, //32
    pub account: Pubkey, // 32
    pub tasklist: Pubkey, // 32
    pub desc: String, // 4 + 32
}

impl TaskGroup {

    pub const LEN:usize = 32 + 32 + 32 +32 +( 4*32 );
    pub fn init(
        &mut self,
        pubkey: Pubkey,
        authority: Pubkey,
        account: Pubkey,
        tasklist: Pubkey,
        desc: String,
    ) {
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
    pub count: u16,
    pub max: u16,
    pub list: [Pubkey; 1000], //todo: change to vec!
}

impl Tasklist {
    pub fn init(&mut self, task_group_key: Pubkey) {
        self.task_group = task_group_key;
        self.count = 0;
        self.max = MAX_TASK as u16;
        self.list = [Pubkey::default(); 1000]
    }

    pub fn add_task(&mut self, task: Pubkey) -> Result<()> {
        if self.count >= self.max {
            return err!(ErrorCode::MaxLimitReached)
        }
        self.list[self.count as usize] = task;
        self.count = self.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn remove_task(&mut self, task: Pubkey) -> Result<()> {
        let new_count = self.count.checked_sub(1).unwrap();
        let index = self.list.iter().position(|&x| x == task).unwrap();
        self.list[index] = self.list[new_count as usize];
        self.count = new_count;
        Ok(())
    }
}
