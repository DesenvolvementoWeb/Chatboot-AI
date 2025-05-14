const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { UserSession, sequelize } = require('./models/UserSession');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'chatboot-session' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

(async () => {
  await sequelize.sync();
  console.log('✅ Banco sincronizado');
})();

const contactInfo = '📞 Contato Tia Bella: https://wa.me/5581985412587';

const enviarBoasVindas = async (msg) => {
  const contato = await msg.getContact();
  const nome = contato.pushname || 'cliente';
  await msg.reply(`Olá, ${nome}🐵! Seja bem-vindo(a) à *Tia Bella Atividades Aquáticas*! 🤗`);
  await client.sendMessage(
    msg.from,
    `Por favor, informe a unidade de seu interesse:\n` +
    `➤ *P* - Paulista\n` +
    `➤ *O* - Olinda`
  );
};

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('🔁 Escaneie o QR code acima com o WhatsApp.');
});

client.on('ready', () => console.log('✅ WhatsApp conectado com sucesso!'));

client.on('message', async (msg) => {
  const from = msg.from;
  const text = msg.body.trim().toLowerCase();

  if (msg.type === 'audio' || msg.type === 'ptt') {
    await msg.reply('🚫 No momento não estamos aceitando mensagens de áudio. Por favor, envie sua dúvida por texto.');
    await enviarBoasVindas(msg);
    return;
  }

  let session = await UserSession.findOne({ where: { chatId: from } });

  if (session && session.isActive === false && !/oi|olá/.test(text)) {
    return;
  }

  if (/desligar|encerrar/i.test(text)) {
    await UserSession.upsert({ chatId: from, isActive: false });
    await msg.reply('🔌 Atendimento encerrado! Quando quiser reiniciar, mande "oi".');
    return;
  }

  if (/(menu|dia|tarde|noite|oi|olá|ola)/i.test(text)) {
    await UserSession.upsert({ chatId: from, unidade: null, isActive: true });
    await enviarBoasVindas(msg);
    return;
  }

  if (!session || !session.unidade) {
    if (text === 'p' || text === 'o') {
      const unidade = text === 'p' ? 'Paulista' : 'Olinda';
      await UserSession.upsert({ chatId: from, unidade });
      await msg.reply(
        `Você escolheu a unidade *${unidade}*.\nAgora, escolha a opção desejada:\n\n` +
        `🏊‍♀️ *1 - Natação Infantil*\n` +
        `💧 *2 - Hidroginástica*\n` +
        `📌 *3 - Conhecer o espaço*`
      );
    }
    return;
  }

  const unidade = session.unidade;

  if (text === '1') {
    const resposta = unidade === 'Paulista'
      ? '🏊‍♀️ *Natação – Unidade Paulista*\n• R$ 80,00 (2 dias na semana)'
      : '🏊‍♀️ *Natação – Unidade Olinda*\n• Matrícula: R$ 50,00\n• R$ 175,00 (2 dias na semana)\n• R$ 110,00 (1 dia - sábado)';
    await msg.reply(resposta);
    await client.sendMessage(from, contactInfo);
  } else if (text === '2') {
    const resposta = unidade === 'Paulista'
      ? '💧 *Hidroginástica – Unidade Paulista*\n• R$ 80,00 (3 dias na semana)'
      : '💧 *Hidroginástica – Unidade Olinda*\n• R$ 170,00 (3 dias na semana)';
    await msg.reply(resposta);
    await client.sendMessage(from, contactInfo);
  } else if (text === '3') {
    await msg.reply(
      '📌 *Outras opções:*\n' +
      '💳 *4* - Falar sobre pagamento com a Tia Bella\n' +
      '📸 *5* - Conhecer nossos espaços (fotos)\n' +
      '👶 *6* - Verificar vagas para crianças\n' +
      '📞 *7* - Falar diretamente com a Tia Bella'
    );
  } else if (text === '4') {
    await msg.reply('💳 Encaminhando para Tia Bella sobre pagamentos...');
    await client.sendMessage(from, contactInfo);
  } else if (text === '5') {
    const link = unidade === 'Paulista'
      ? 'https://drive.google.com/drive/folders/13ZG1l65fTTJ2zhaXhfOeS_wKIeyKQM-m?usp=drive_link'
      : 'https://drive.google.com/drive/folders/1GEKXsBrH5D4prUXyFkBoyrNIIEVGnV5X?usp=drive_link';
    await msg.reply(`📸 Veja as fotos da unidade *${unidade}*:\n${link}`);
    await client.sendMessage(from, contactInfo);
  } else if (text === '6') {
    await msg.reply('👶 Vamos verificar a disponibilidade de vaga para a idade informada.');
    await client.sendMessage(from, contactInfo);
  } else if (text === '7') {
    await msg.reply('📞 Encaminhando seu atendimento para a Tia Bella...');
    await msg.reply('✅ Sua mensagem foi encaminhada com sucesso!');
  } else {
    await msg.reply(
      '🚫 Desculpa, não entendi. Por favor, selecione uma das opções abaixo ou digite *oi* para reiniciar o atendimento.\n' +
      '🏊‍♀️ *1 - Natação Infantil*\n' +
      '💧 *2 - Hidroginástica*\n' +
      '📌 *3 - Conhecer o espaço*'
    );
  }
});

client.on('call', async (call) => {
  await call.reject();
  const contato = call.from;

  await client.sendMessage(contato,
    '🚫 No momento não estamos aceitando ligações. Por favor, envie sua dúvida por mensagem de texto.'
  );

  await client.sendMessage(contato,
    'Olá! Seja bem-vindo(a) à *Tia Bella Atividades Aquáticas*! 🤗\n\n' +
    'Por favor, informe a unidade de seu interesse:\n' +
    '➤ *P* - Paulista\n' +
    '➤ *O* - Olinda'
  );

});
client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp desconectado:', reason);
});
client.initialize();
