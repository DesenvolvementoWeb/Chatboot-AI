// chatboot.js - Corrigido para gerar QRCode em modo texto (compatível com Termius)

import { generate } from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'chatboot-session' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome-stable' // ou deixe vazio se usar o chromium do puppeteer
  }
});

const userUnit = {};

const contactInfo = '📞 Contato Tia Bella: https://wa.me/5581985412587';

client.on('qr', qr => {
  generate(qr, { small: true });
  console.log('🔁 Escaneie o QR code acima com o WhatsApp.');
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado com sucesso!');
});

client.on('message', async msg => {
  const text = msg.body.toLowerCase();
  if (text === 'oi' || text === 'olá') {
    await msg.reply('Olá! Sou seu bot 😄');
  }
});

client.initialize();

client.on('message', async msg => {
  const text = msg.body.toLowerCase();
  const from = msg.from;

  if (!from.endsWith('@c.us')) return;

  const upperText = text.trim().toUpperCase();

  if (/^(menu|dia|tarde|noite|oi|olá|ola)$/.test(text)) {
    delete userUnit[from];

    await delay(2000);
    await (await msg.getChat()).sendStateTyping();
    await delay(2000);

    const contact = await msg.getContact();
    const name = contact.pushname || 'Cliente';

    await client.sendMessage(from, `Olá, ${name.split(' ')[0]}! Seja bem-vindo(a) à *Tia Bella Atividades Aquáticas*! 🤗`);
    await delay(2000);
    await (await msg.getChat()).sendStateTyping();
    await delay(2000);

    await client.sendMessage(
      from,
      `Por favor, informe a unidade de seu interesse:\n\n➤ *P* - Paulista\n➤ *O* - Olinda`
    );
    return;
  }


  if (!userUnit[from] && (upperText === 'P' || upperText === 'O')) {
    const unidade = upperText === 'P' ? 'Paulista' : 'Olinda';
    userUnit[from] = unidade;

    await delay(2000);
    await (await msg.getChat()).sendStateTyping();
    await delay(2000);

    await client.sendMessage(
      from,
      `Você escolheu a unidade *${unidade}*.\nAgora, escolha a opção desejada:\n\n🏊‍♀️ *1 - Natação Infantil*\n💧 *2 - Hidroginástica*\n📌 *3 - Opção 3: Conhecer o espaço*`
    );
    return;
  }


  if (userUnit[from] && upperText === '1') {
    const unidade = userUnit[from];

    await delay(2000); await (await msg.getChat()).sendStateTyping(); await delay(2000);

    const mensagem = unidade === 'Paulista'
      ? '🏊‍♀️ *Natação – Unidade Paulista*\n• R$ 80,00 (2 dias na semana)'
      : '🏊‍♀️ *Natação – Unidade Olinda*\n• Matrícula: R$ 50,00\n• R$ 175,00 (2 dias na semana)\n• R$ 110,00 (1 dia - sábado)';

    await client.sendMessage(from, mensagem);
    await delay(2000);
    await client.sendMessage(from, contactInfo);
    return;
  }


  if (userUnit[from] && upperText === '2') {
    const unidade = userUnit[from];

    await delay(2000); await (await msg.getChat()).sendStateTyping(); await delay(2000);

    const mensagem = unidade === 'Paulista'
      ? '💧 *Hidroginástica – Unidade Paulista*\n• R$ 80,00 (3 dias na semana)'
      : '💧 *Hidroginástica – Unidade Olinda*\n• R$ 170,00 (3 dias na semana)';

    await client.sendMessage(from, mensagem);
    await delay(2000);
    await client.sendMessage(from, contactInfo);
    return;
  }


  if (userUnit[from] && upperText === '3') {
    await delay(2000); await (await msg.getChat()).sendStateTyping(); await delay(2000);
    await client.sendMessage(
      from,
      `📌 *Outras opções:*\n💳 *4* - Falar sobre pagamento com a Tia Bella\n📸 *5* - Conhecer nossos espaços – fotos das piscinas e aulas\n👶 *6* - Saber se há vaga para criança de X anos\n📞 *7* - Falar diretamente com a Tia Bella`
    );
    return;
  }


  if (userUnit[from] && upperText === '4') {
    await delay(2000); await (await msg.getChat()).sendStateTyping(); await delay(2000);
    await client.sendMessage(from, '💳 Encaminhando para Tia Bella sobre pagamentos...');
    await client.sendMessage(from, contactInfo);
    return;
  }


  if (userUnit[from] && upperText === '5') {
    const unidade = userUnit[from];
    const link = unidade === 'Paulista'
      ? 'https://drive.google.com/drive/folders/13ZG1l65fTTJ2zhaXhfOeS_wKIeyKQM-m?usp=drive_link'
      : 'https://drive.google.com/drive/folders/1GEKXsBrH5D4prUXyFkBoyrNIIEVGnV5X?usp=drive_link';

    await delay(2000);
    await client.sendMessage(from, `📸 Veja as fotos da unidade *${unidade}*:\n${link}`);
    await delay(2000);
    await client.sendMessage(from, contactInfo);
    return;
  }


  if (userUnit[from] && upperText === '6') {
    await delay(2000);
    await client.sendMessage(from, '👶 Vamos verificar a disponibilidade de vaga para a idade informada.');
    await delay(2000);
    await client.sendMessage(from, contactInfo);
    return;
  }


  if (userUnit[from] && upperText === '7') {
    await client.sendMessage(from, '📞 Encaminhando seu atendimento para a Tia Bella...');
    const bellaChatId = '5581985412587@c.us';
    const chatCliente = await msg.getChat();
    await chatCliente.forwardMessages(bellaChatId, [msg.id._serialized]);
    return;
  }

});

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

client.initialize();
