import React from "react";
import { Link } from "react-router-dom";

const Versao = ({ versao }) => {
  return (
    <div className="about-page versao-page">
      <div className="about-content">
        <div className="feature-grid">
          <div className="feature-card highlight">
            <h3>Versão da Aplicação</h3>
            {versao ? (
              <h4 className="versao-valor">{versao}</h4>
            ) : (
              <p className="versao-indisponivel">
                Não foi possível obter a versão da aplicação no momento.
                Verifique se a API está disponível e tente novamente.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="about-footer">
        <Link to="/" className="back-button">
          ← Voltar
        </Link>
      </div>
    </div>
  );
};

export default Versao;
