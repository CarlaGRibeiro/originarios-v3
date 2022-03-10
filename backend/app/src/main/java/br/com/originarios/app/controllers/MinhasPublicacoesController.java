package br.com.originarios.app.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.originarios.app.models.entities.Produto;
import br.com.originarios.app.models.entities.Publicacao;
import br.com.originarios.app.models.entities.Usuario;
import br.com.originarios.app.models.repositories.ProdutoRepository;
import br.com.originarios.app.models.repositories.PublicacaoRepository;
import br.com.originarios.app.models.repositories.UsuarioRepository;
import br.com.originarios.app.payload.response.MsgResponse;
import br.com.originarios.app.security.jwt.JwtUtils;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/minhas-publicacoes")
public class MinhasPublicacoesController{
	
	@Autowired
	UsuarioRepository usuarioRepository;
	
	@Autowired
	PublicacaoRepository publicacaoRepository;
	
	@Autowired
	private JwtUtils jwtUtils;
	
	@PostMapping
	public ResponseEntity<?> postPublicacao(
			@RequestHeader("Authorization") String token,
			@RequestBody Publicacao publicacao){
		
		try {
			
			token = token.substring(7, token.length());
			String usuarioEmail = jwtUtils.getUserNameFromJwtToken(token);
			
			Optional<Usuario> usuario = usuarioRepository.findByEmail(usuarioEmail);
			if(usuario.isEmpty()) {
				return ResponseEntity.badRequest()
						.body(new MsgResponse("Erro: Cliente não encontrado!"));
			}
			
			publicacao.setUsuario(usuario.get());
		
			publicacaoRepository.save(publicacao);
			
			return ResponseEntity.ok(publicacao);
		
		} catch (Exception e) {
			
			return ResponseEntity.internalServerError().body(
					new MsgResponse("Erro ao cadastrar a publicacao!"));
		}
	}

	@PutMapping
	public ResponseEntity<?> putPublicacao(
			@RequestHeader("Authorization") String token,
			@RequestBody Publicacao novaPublicacao){
		
		try {
			
			token = token.substring(7, token.length());
			String usuarioEmail = jwtUtils.getUserNameFromJwtToken(token);
			
			Optional<Usuario> usuario = usuarioRepository.findByEmail(usuarioEmail);
			if(usuario.isEmpty()) {
				return ResponseEntity.badRequest()
						.body(new MsgResponse("Erro: Cliente não encontrado!"));
			}
			
			Optional<Publicacao> publicacao = publicacaoRepository.findById(novaPublicacao.getId());
			if(publicacao.isEmpty()) {
				return ResponseEntity.badRequest()
						.body(new MsgResponse("Erro: Publicação não encontrada!"));
			}
			
			if(!publicacao.get().usuarioEValido(usuario.get())) {
				return ResponseEntity.badRequest()
					.body(new MsgResponse("Erro: Cliente não autorizado a atualizar esta publicação!"));
			}

			novaPublicacao.setUsuario(usuario.get());
			
			publicacaoRepository.save(novaPublicacao);
			
			return ResponseEntity.ok(novaPublicacao);
		
		} catch (Exception e) {
			
			return ResponseEntity.internalServerError().body(
					new MsgResponse("Erro ao atualizar a publicação!"));
		}
	}
//	
//	@DeleteMapping
//	public ResponseEntity<?> deleteProduto(
//			@RequestHeader("Authorization") String token,
//			@RequestParam(name = "produtoId") Integer produtoId){
//		
//		try {
//		
//			token = token.substring(7, token.length());
//			String usuarioEmail = jwtUtils.getUserNameFromJwtToken(token);
//			
//			Optional<Usuario> usuario = usuarioRepository.findByEmail(usuarioEmail);
//			if(usuario.isEmpty()) {
//				return ResponseEntity.badRequest()
//						.body(new MsgResponse("Erro: Cliente não encontrado!"));
//			}
//			
//			Optional<Produto> produto = produtoRepository.findById(produtoId);
//			if(produto.isEmpty()) {
//				return ResponseEntity.badRequest()
//						.body(new MsgResponse("Erro: Produto não encontrado!"));
//			}
//			
//			if(!produto.get().usuarioEValido(usuario.get())) {
//				return ResponseEntity.badRequest()
//						.body(new MsgResponse("Erro: Cliente não autorizado a deletar este produto!"));
//			}
//			
//			produtoRepository.deleteById(produto.get().getId());
//			
//			return ResponseEntity.ok(new MsgResponse("Produto deletado com sucesso!"));
//				
//		} catch (Exception e) {
//			
//			return ResponseEntity.internalServerError().body(
//					new MsgResponse("Erro ao deletar o produto!"));
//		}
//	}
//	
//	@GetMapping
//	public ResponseEntity<?> getMeusProdutos(
//			@RequestHeader("Authorization") String token,
//			@RequestParam(name = "inicio", defaultValue = "0") int inicio,
//			@RequestParam(name = "qtd", defaultValue = "5") int qtd){
//		
//		try {
//
//			token = token.substring(7, token.length());
//			String usuarioEmail = jwtUtils.getUserNameFromJwtToken(token);
//			
//			Optional<Usuario> usuario = usuarioRepository.findByEmail(usuarioEmail);
//			if(usuario.isEmpty()) {
//				return ResponseEntity.badRequest()
//						.body(new MsgResponse("Erro: Cliente não encontrado!"));
//			}
//			
//			List<Produto> produtos = usuario.get().getProdutos();
//
//			List<Produto> produtosInvertido = new ArrayList<>();
//			int total = produtos.size();
//			for (int i = total - 1; i >= 0; i--) {
//				produtosInvertido.add(produtos.get(i));
//			}
//			
//			int resto = total - inicio;
//			qtd = (resto < qtd) ? resto : qtd;
//			
//			List<Produto> produtosResponse = new ArrayList<>();
//			for (int i = inicio; i < (inicio + qtd); i++) {
//				produtosResponse.add(produtosInvertido.get(i));
//			}
//			
//			return ResponseEntity.ok(produtosResponse);
//			
//		} catch (Exception e) {
//			
//			return ResponseEntity.internalServerError().body(
//					new MsgResponse("Erro na obtenção dos produtos!"));
//		}
//	}
}