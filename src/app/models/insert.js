import supabase from "../services/supabaseClient.js";
import logger from "../../utils/logger.js";
export async function insertTransactions(transactions) {
  const normalized = Array.isArray(transactions)
    ? transactions
    : [transactions];

  // Ambil semua txid dari database
  const txids = normalized.map((tx) => tx.txid);
  const { data: existing, error: selectError } = await supabase
    .from("transactions")
    .select("txid")
    .in("txid", txids);

  const existingTxids = (existing || []).map((tx) => tx.txid);

  // Filter yang belum ada
  const dataToInsert = normalized
    .filter((tx) => !existingTxids.includes(tx.txid))
    .map((tx) => ({
      txid: tx.txid,
      type: tx.title,
      sender: tx.sender,
      receiver: tx.receiver,
      amount: tx.amount,
      timestamp: tx.timestamp,
      created_at: new Date().toISOString(),
    }));

  if (dataToInsert.length === 0) {
    return { data: [], error: null }; // Nothing new to insert
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(dataToInsert);

  return { data, error };
}

export async function insertUser(username, balance) {
  const { data, error } = await supabase.from("users").upsert(
    {
      username,
      balance: Number(balance),
      last_updated: Date.now(),
      tx_count: 1,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "username", // agar tidak duplikat
    }
  );

  if (error) {
    logger.error(`Error inserting/updating user ${username}: ${error.message}`);
  } else {
    logger.info(`User ${username} inserted/updated successfully`);
  }

  return { data, error };
}
