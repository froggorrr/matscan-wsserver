import tx from "../services/discordAPI.js";
import embedParser from "../../utils/embedParser.js";
import supabase from "../services/supabaseClient.js";
import { insertTransactions, insertUser } from "../models/insert.js";
import { updateUsers } from "../models/update.js";

const searchTx = async (query) => {
  const transactions = await tx(query);
  const total_results = transactions.total_results;
  const messages = transactions.messages;
  return {
    total_results,
    transactions: messages.map((message) => embedParser(message[0].embeds[0])),
  };
};

const search = async (query, type) => {

  if (type === "transactions") {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .maybeSingle()
      .eq("txid", query);
    if (data) {
      return data;
    }
    const result = (await searchTx(query)).transactions[0];
    await insertTransactions(result);
    return result;
  }

  if (type === "users") {
    const { data: userData } = await supabase
    .from("users")
    .select("username, balance, last_updated")
    .maybeSingle()
    .eq("username", query);

  if (userData) {
    // Hitung total transaksi user (sebagai sender atau receiver)
    const { count: tx_count, error: countError } = await supabase
      .from("transactions")
      .select("txid", { count: "exact", head: true })
      .or(`sender.eq.${query},receiver.eq.${query}`)

    // Ambil 10 transaksi terbaru user
    const { data: latest_tx } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender.eq.${query},receiver.eq.${query}`)
      .order("timestamp", { ascending: false })
      .limit(10);

    return {
      username: userData.username,
      balance: userData.balance,
      tx_count: tx_count || 0,
      latest_tx: latest_tx || [],
    };
  }

    // Jika data user tidak ditemukan, ambil transaksi dari API
    const result = (await searchTx(query)).transactions;
    await insertTransactions(result);

    const tx = result[0];
    let userBalance;

    // Insert atau update user berdasarkan apakah receiver atau sender adalah 'system'
    if (tx.receiver !== "system") {
      tx.updateTo = query;
      const { data: updated } = await updateUsers(tx);

      if (!updated) {
        // Insert both users
        await insertUser(tx.receiver, tx.receiverBalance);
        await insertUser(tx.sender, tx.senderBalance);
      }
    } else {
      // Insert only sender
      await insertUser(tx.sender, tx.senderBalance);
    }

    // Tentukan balance user berdasarkan query-nya
    if (tx.sender === query) {
      userBalance = tx.senderBalance;
    } else if (tx.receiver === query) {
      userBalance = tx.receiverBalance;
    }

    // Mengembalikan data user dengan balance dan tx_count yang baru
    return {
      username: query,
      balance: Number(userBalance),
      tx_count: 1, // karena ini adalah transaksi baru yang dimasukkan, jumlah transaksi bisa dihitung
      latest_tx: [tx], // transaksi terbaru hanya satu, karena baru saja diproses
    };
  }
};


export { search, searchTx };
