const parseTransaction = (transaction) => {
  const lines = transaction.description.replace("N/A", "<@123> (123 - system)").split('\n');

  let amount, sender, senderId, senderBalance, receiver, receiverId, receiverBalance, txid;

  lines.forEach((line) => {
    if (line.startsWith("**Amount**")) {
      const match = line.match(/\*\*Amount\*\*: (\d+)/);
      if (match) amount = match[1];
    }

    if (line.startsWith("**Sender**")) {
      const match = line.match(/\*\*Sender\*\*: <@(\d+)> \(\d+ - ([\w.\-]+)\)/);
      if (match) {
        senderId = match[1];
        sender = match[2];
      }
    }

    if (line.startsWith("**Sender Balance**")) {
      const match = line.match(/\*\*Sender Balance\*\*: (\d+)/);
      if (match) senderBalance = match[1];
    }

    if (line.startsWith("**Receiver**")) {
      const match = line.match(/\*\*Receiver\*\*: <@(\d+)> \(\d+ - ([\w.\-]+)\)/);
      if (match) {
        receiverId = match[1];
        receiver = match[2];
      }
    }

    if (line.startsWith("**Receiver Balance**")) {
      const match = line.match(/\*\*Receiver Balance\*\*: (\d+)/);
      if (match) receiverBalance = match[1];
    }

    if (line.startsWith("**Transaction ID**")) {
      const match = line.match(/\*\*Transaction ID\*\*: ([\da-f]+)/i);
      if (match) txid = match[1];
    }
  });

  // Validasi field penting
  if (!amount || !sender || !receiver || !txid) {
    console.log("Missing required fields");
    return;
  }

  // Bangun objek hasil
  const result = {
    title: transaction.title.replace("Transaction: ", ""),
    timestamp: transaction.timestamp,
    amount,
    sender,
    receiver,
    txid,
  };

  // Tambah saldo jika bukan system
  if (sender !== "system") {
    result.senderBalance = senderBalance;
  }

  if (receiver !== "system") {
    result.receiverBalance = receiverBalance;
  }

  return result;
};

export default parseTransaction;
