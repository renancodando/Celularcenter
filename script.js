(() => {
  'use strict';

  const formulario = document.querySelector('#form');
  const retorno = document.querySelector('#message');
  const whatsapp = '5522992565429';

  if (!formulario || !retorno) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!formulario.reportValidity()) return;

    const dados = new FormData(formulario);
    const marca = String(dados.get('marca') || '').trim();
    const modelo = String(dados.get('modelo') || '').trim();
    const problema = String(dados.get('problema') || '').trim();

    if (!marca || !modelo || !problema) {
      retorno.textContent = 'Preencha a marca, o modelo e o problema do aparelho.';
      return;
    }

    const mensagem = [
      'Olá, Celular Center! Gostaria de solicitar uma avaliação do meu celular.',
      '',
      'Marca: ' + marca,
      'Modelo: ' + modelo,
      'Problema: ' + problema
    ].join('\n');

    const url = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(mensagem);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Abrir conversa no WhatsApp';
    retorno.replaceChildren(document.createTextNode('Mensagem preparada. Se o WhatsApp não abrir, '), link, document.createTextNode('.'));
    link.click();
  });
})();
