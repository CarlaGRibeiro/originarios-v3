import axios from "axios";
import { actionGetProdutos } from "../store/actions/produtos/produtos.action";
import { actionGetPublicacoes } from "../store/actions/publicacoes/publicacoes.action";
import {
  actionGetMinhasPublicacoes,
  actionPostPublicacao,
  actionPutPublicacao,
  actionDeletePublicacao,
} from "../store/actions/publicacoes/minhasPublicacoes.action";
import { actionInfoModal } from "../store/actions/modal/infoModal.actions";
import {
  actionDeleteProduto,
  actionGetMeusProdutos,
  actionPostProduto,
  actionPutProduto,
} from "../store/actions/produtos/meusProdutos.action";
import { actionPaginacao } from "../store/actions/paginacao/paginacao.action";

export const url = `https://originarios.herokuapp.com`;
const msgErroServ = "Erro na comunicação com o servidor!";

const tratarErro = (res, msgSuc, msgErro) => async (dispatch) => {
  if (!res.status) {
    dispatch(actionInfoModal(msgErroServ, false));
  } else if (res.status === 200) {
    if (msgSuc !== null) {
      dispatch(actionInfoModal(msgSuc, true));
    }
    return true;
  } else {
    dispatch(actionInfoModal(msgErro, false));
  }
  return false;
};

const api = axios.create({
  baseURL: `${url}/api`,
  headers: {
    "Content-type": "application/json",
  },
});

const configToken = () => {
  const OrigTkn = JSON.parse(localStorage.getItem("OrigTkn"));
  const header = {
    Authorization: `${OrigTkn.tokenType} ${OrigTkn.token}`,
  };
  return header;
};

////////////// endpoints usuário //////////////////
export const postContato = async (contato) => {
  const res = await api
    .post(`/contato`, contato)
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

export const postRegistro = async (registro) => {
  const res = await api
    .post(`/auth/registro`, registro)
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

export const login = async (autenticacao) => {
  const res = await api
    .post(`/auth/login`, autenticacao)
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

export const getMeusDados = async () => {
  const res = await api
    .get(`/usuario`, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

export const putMeusDados = async (usuario) => {
  const res = await api
    .put(`/usuario`, usuario, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

export const putMinhaSenha = async (senhas) => {
  const res = await api
    .put(`/usuario/senha`, senhas, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => error.response);
  return res;
};

////////////////// produtos //////////////////
export const getProdutos =
  (pagina = 0, qtd = 10) =>
  async (dispatch) => {
    const res = await api
      .get(`/produtos?pagina=${pagina}&qtd=${qtd}`)
      .then((res) => {
        res.data = res.data.map(({ produto, usuarioResponse }) => {
          return {
            ...produto,
            usuario: { ...usuarioResponse },
          };
        });
        return res;
      })
      .catch((error) => (error.response ? error.response : error));

    if (await dispatch(tratarErro(res, null, "Erro ao trazer os produtos!"))) {
      if (res.data.length === 0) {
        dispatch(actionInfoModal("Sem novos dados!", false));
      } else {
        dispatch(actionGetProdutos(res.data));
        dispatch(actionPaginacao("pgProdutos", pagina));
        return true;
      }
    }
    return false;
  };

export const getMeusProdutos =
  (inicio = 0, qtd = 10) =>
  async (dispatch) => {
    const res = await api
      .get(`/meus-produtos?inicio=${inicio}&qtd=${qtd}`, {
        headers: configToken(),
      })
      .then((res) => res)
      .catch((error) => (error.response ? error.response : error));

    if (await dispatch(tratarErro(res, null, "Erro ao trazer os produtos!"))) {
      if (res.data.length === 0) {
        dispatch(actionInfoModal("Sem novos dados!", false));
      } else {
        dispatch(actionGetMeusProdutos(res.data));
        dispatch(actionPaginacao("inMeusProdutos", inicio));
        return true;
      }
    }
    return false;
  };

export const postProduto = (produto) => async (dispatch) => {
  const res = await api
    .post(`/meus-produtos`, produto, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(res, "Produto salvo com sucesso!", "Erro ao salvar o produto!")
    )
  ) {
    dispatch(actionPostProduto(res.data));
    dispatch(getProdutos());
    return true;
  }
  return false;
};

export const putProduto = (produto) => async (dispatch) => {
  const res = await api
    .put(`/meus-produtos`, produto, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(res, "Produto salvo com sucesso!", "Erro ao salvar o produto!")
    )
  ) {
    dispatch(actionPutProduto(res.data));
    dispatch(getProdutos());
    return true;
  }
  return false;
};

export const deleteProduto = (produto) => async (dispatch) => {
  const res = await api
    .delete(`/meus-produtos`, {
      headers: configToken(),
      params: {
        produtoId: produto.id,
      },
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(
        res,
        "Produto deletado com sucesso!",
        "Erro ao deletar o produto!"
      )
    )
  ) {
    dispatch(actionDeleteProduto(produto.id));
    dispatch(getProdutos());
    return true;
  }
  return false;
};

export const getDadosImagem = async (id) => {
  const res = await api
    .get(`/imagens/dados/${id}`)
    .then((res) => res.data)
    .catch(() => null);
  return res;
};

////////////////// publicacoes //////////////////
export const getPublicacoes =
  (pagina = 0, qtd = 10) =>
  async (dispatch) => {
    const res = await api
      .get(`/publicacoes?pagina=${pagina}&qtd=${qtd}`)
      .then((res) => {
        res.data = res.data.map(({ publicacao, usuarioResponse }) => {
          return {
            ...publicacao,
            usuario: { ...usuarioResponse },
          };
        });
        return res;
      })
      .catch((error) => (error.response ? error.response : error));

    if (
      await dispatch(tratarErro(res, null, "Erro ao trazer as publicações!"))
    ) {
      if (res.data.length === 0) {
        dispatch(actionInfoModal("Sem novos dados!", false));
      } else {
        dispatch(actionGetPublicacoes(res.data));
        dispatch(actionPaginacao("pgPublicacoes", pagina));
        return true;
      }
    }
    return false;
  };

export const getMinhasPublicacoes =
  (inicio = 0, qtd = 10) =>
  async (dispatch) => {
    const res = await api
      .get(`/minhas-publicacoes?inicio=${inicio}&qtd=${qtd}`, {
        headers: configToken(),
      })
      .then((res) => res)
      .catch((error) => (error.response ? error.response : error));

    if (
      await dispatch(tratarErro(res, null, "Erro ao trazer as publicações!"))
    ) {
      if (res.data.length === 0) {
        dispatch(actionInfoModal("Sem novos dados!", false));
      } else {
        dispatch(actionGetMinhasPublicacoes(res.data));
        dispatch(actionPaginacao("inMinhasPublicacoes", inicio));
        return true;
      }
    }
    return false;
  };

export const postPublicacao = (publicacao) => async (dispatch) => {
  const res = await api
    .post(`/minhas-publicacoes`, publicacao, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(
        res,
        "Publicação salva com sucesso!",
        "Erro ao salvar a publicação!"
      )
    )
  ) {
    dispatch(actionPostPublicacao(res.data));
    dispatch(getPublicacoes());
    return true;
  }
  return false;
};

export const putPublicacao = (publicacao) => async (dispatch) => {
  const res = await api
    .put(`/minhas-publicacoes`, publicacao, {
      headers: configToken(),
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(
        res,
        "Publicação salva com sucesso!",
        "Erro ao salvar a publicação!"
      )
    )
  ) {
    dispatch(actionPutPublicacao(res.data));
    dispatch(getPublicacoes());
    return true;
  }
  return false;
};

export const deletePublicacao = (publicacao) => async (dispatch) => {
  const res = await api
    .delete(`/minhas-publicacoes`, {
      headers: configToken(),
      params: {
        publicacaoId: publicacao.id,
      },
    })
    .then((res) => res)
    .catch((error) => (error.response ? error.response : error));

  if (
    await dispatch(
      tratarErro(
        res,
        "Publicação deletada com sucesso!",
        "Erro ao deletar a publicação!"
      )
    )
  ) {
    dispatch(actionDeletePublicacao(publicacao.id));
    dispatch(getPublicacoes());
    return true;
  }
  return false;
};
