import React, { useState } from "react";
import Modal from "./Modal";
import { isoParaBr } from "../utils/date";

const AddTask = ({ onAdd }) => {
  const [titulo, setTitulo] = useState("");
  const [dia, setDia] = useState("");
  const [importante, setImportante] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setShowModal(true);
      return;
    }

    // `dia` guarda o valor ISO (YYYY-MM-DD) do <input type="date">.
    // Converte para DD/MM/YYYY (formato que a API/banco já usam). Sem data
    // escolhida, mantém o comportamento atual: data de hoje em pt-BR.
    onAdd({
      titulo: titulo.trim(),
      dia_atividade: dia ? isoParaBr(dia) : new Date().toLocaleDateString('pt-BR'),
      importante
    });

    setTitulo("");
    setDia("");
    setImportante(true);
  };

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <div className="form-control">
        <label>Tarefa</label>
        <input
          type="text"
          placeholder="O que você precisa fazer?"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="dia_atividade">Data/Prazo</label>
        <input
          type="date"
          id="dia_atividade"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
        />
      </div>
      
      <div className="form-control-check">
        <input
          type="checkbox"
          id="importante"
          checked={importante}
          onChange={(e) => setImportante(e.target.checked)}
        />
        <label htmlFor="importante">Importante</label>
      </div>
      
      <button type="submit" className="btn btn-block success">
        Adicionar nova task
      </button>
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Campo obrigatório"
        message="Por favor, adicione uma descrição para a tarefa"
        type="warning"
      />
    </form>
  );
};

export default AddTask;
