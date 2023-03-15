import type {
	Connection,
	ParsedTransactionMeta,
	ParsedTransactionWithMeta,
	PublicKey,
	SignaturesForAddressOptions
} from '@solana/web3.js';
import { PayroundClient } from './payround/protocol';



export const getTransactionsFor = async (address: PublicKey, connection: Connection, options?: SignaturesForAddressOptions) => {
	const signatureInfos = await connection.getSignaturesForAddress(address, options, 'confirmed');

	const parsedTransactions = await Promise.all(
		signatureInfos.map(async (sigInfo) => {
			const parsedTx = await connection.getParsedTransaction(sigInfo.signature, 'confirmed');
			return {
				sigInfo,
				parsedTx
			};
		})
	);

	return parsedTransactions;
};

export const getTransactionsFilterByMint = async (address: PublicKey, connection: Connection, options?:SignaturesForAddressOptions) => {
	const i = await getTransactionsFor(address, connection, options);
	return i.filter((i) => {
		return filterTxByMint2(i.parsedTx!.meta);
	});
};

export const filterTxByMint = (txMeta: ParsedTransactionMeta | null) => {
	if (
		txMeta == null ||
		txMeta.preTokenBalances == null ||
		txMeta.preTokenBalances == undefined ||
		txMeta.preTokenBalances.length == 0
	)
		return false;
	return txMeta.preTokenBalances![0].mint == PayroundClient.MOCK_USDC_MINT.toBase58();
};

export const filterTxByMint2 = (txMeta: ParsedTransactionMeta | null) => {
	if (
		txMeta == null ||
		txMeta.preTokenBalances == null ||
		undefined ||
		txMeta.postTokenBalances == null ||
		undefined
	)
		return false;
	if (txMeta.preTokenBalances?.length > 0 || txMeta.postTokenBalances.length > 0)
		return (
			txMeta.preTokenBalances![0].mint == PayroundClient.MOCK_USDC_MINT.toBase58() ||
			txMeta.postTokenBalances![0].mint == PayroundClient.MOCK_USDC_MINT.toBase58()
		);
	else {
		return false
	}
};

export const truncate = (str: string, len: number = 10) => {
	return str.length > len ? `${str.slice(0, Math.floor(len/2))}...${str.slice(Math.floor(str.length - len/2))}` : str;
}


export const formatEpoch = (epochMs: number | string) =>{
	const hour = new Date (epochMs).getHours()
	const period = hour < 12 ? "AM" : "PM"
	const formatHour = hour%12 == 0 ? '12' : formatTime(hour)
	const formatMin = formatTime(new Date(epochMs).getMinutes())
	const formatSec = formatTime(new Date(epochMs).getSeconds())
	return `${new Date(Number(epochMs)).toDateString()}, ${formatHour}:${formatMin}:${formatSec} ${period}`;
}

const formatTime = (number: number) => number < 10 ? `0${number}` : `${number}`;


