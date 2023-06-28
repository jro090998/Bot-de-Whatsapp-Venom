import requests
import excel2img
import uuid
import os

retorno = requests.get("http://localhost:3000/api/statusVenom")

if not retorno.ok: 
    print ('Sessao do Venom inativa')
    exit()

###Nome do Grupo que será enviado a imagem###    
nomeGrupo = 'DESPESAS' 
retornoIdGrupo = requests.get("http://localhost:3000/api/grupoID?nomeGrupo=" + nomeGrupo)
if not retornoIdGrupo.ok: 
    print ('Ocorreu um erro ao adquirir o id do grupo')
    exit()

codigoUnico = uuid.uuid1()

##### Nome da Tabela que sera gerada a imagem####
arquivoExcel = "./files/tabela.xlsx" 
#### Nome do Arquivo de imagem gerado apos a exportação###
nomeImagem = str(codigoUnico) + ".png"
### Nome da Planilha ''Sheetname'' que será exportado###
sheetName ="a"
### Range das células que serão impressas###
cellsRange="B2:M8"

url = 'http://localhost:3000/api/send-image'
destinatario = retornoIdGrupo.json()
caminhoImagem = 'files\\' + nomeImagem
legenda = 'teste'

excel2img.export_img(arquivoExcel,caminhoImagem,sheetName,cellsRange)
if not os.path.isfile('./files/' + nomeImagem):
    print ('Arquivo não encontrado')
    exit()

data = {
    'to': destinatario,
    'image':caminhoImagem, 
    'caption':legenda,
    'nomeImagem':nomeImagem
}

response = requests.post(url, json=data)


if response.ok:
    if os.path.exists('./files/' + nomeImagem):
        os.remove(caminhoImagem)
    print('Imagem enviada com sucesso!')
else:
    print('Erro ao enviar imagem!')
