const tarefasController = require('../../../api/controllers/tarefas');

// Mock do initializeModels
jest.mock('../../../api/models', () => {
  return jest.fn();
});

// Mock do cache (Redis) — os testes não dependem de um Redis real
jest.mock('../../../lib/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  ttl: jest.fn()
}));

const initializeModels = require('../../../api/models');
const cache = require('../../../lib/cache');

describe('Tarefas Controller', () => {
  let req, res, mockTarefas;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockTarefas = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
      update: jest.fn()
    };

    initializeModels.mockResolvedValue({ Tarefas: mockTarefas });
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('deve criar uma tarefa com sucesso', async () => {
      const novaTarefa = {
        titulo: 'Teste',
        dia_atividade: '2026-01-26',
        importante: true
      };
      req.body = novaTarefa;

      const tarefaCriada = { uuid: '123', ...novaTarefa };
      mockTarefas.create.mockResolvedValue(tarefaCriada);

      const { create } = tarefasController();
      await create(req, res);

      expect(mockTarefas.create).toHaveBeenCalledWith(novaTarefa);
      expect(res.send).toHaveBeenCalledWith(tarefaCriada);
    });

    test('deve retornar erro 500 ao falhar', async () => {
      req.body = { titulo: 'Teste' };
      mockTarefas.create.mockRejectedValue(new Error('Erro no banco'));

      const { create } = tarefasController();
      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Erro no banco'
      });
    });
  });

  describe('find', () => {
    test('deve retornar uma tarefa por uuid', async () => {
      const tarefa = { uuid: '123', titulo: 'Teste' };
      req.params.uuid = '123';
      mockTarefas.findByPk.mockResolvedValue(tarefa);

      const { find } = tarefasController();
      await find(req, res);

      expect(mockTarefas.findByPk).toHaveBeenCalledWith('123');
      expect(res.send).toHaveBeenCalledWith(tarefa);
    });

    test('deve retornar 404 quando tarefa não existe', async () => {
      req.params.uuid = '999';
      mockTarefas.findByPk.mockResolvedValue(null);

      const { find } = tarefasController();
      await find(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Tarefa não encontrada.'
      });
    });

    test('deve retornar erro 500 ao falhar', async () => {
      req.params.uuid = '123';
      mockTarefas.findByPk.mockRejectedValue(new Error('Erro no banco'));

      const { find } = tarefasController();
      await find(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Erro no banco'
      });
    });
  });

  describe('findAll', () => {
    test('deve retornar todas as tarefas', async () => {
      const tarefas = [
        { uuid: '1', titulo: 'Tarefa 1' },
        { uuid: '2', titulo: 'Tarefa 2' }
      ];
      mockTarefas.findAll.mockResolvedValue(tarefas);

      const { findAll } = tarefasController();
      await findAll(req, res);

      expect(mockTarefas.findAll).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ dbTime: expect.any(Number), data: tarefas });
      expect(cache.get).not.toHaveBeenCalled();
    });

    describe('com cache habilitado', () => {
      beforeEach(() => {
        process.env.CACHE_ENDPOINT = 'redis';
        process.env.CACHE_TTL = '15';
      });

      afterEach(() => {
        delete process.env.CACHE_ENDPOINT;
        delete process.env.CACHE_TTL;
      });

      test('cache hit: retorna do cache sem consultar o banco', async () => {
        const tarefas = [{ uuid: '1', titulo: 'Tarefa 1' }];
        cache.get.mockResolvedValue({ data: tarefas, error: false });
        cache.ttl.mockResolvedValue(10);

        const { findAll } = tarefasController();
        await findAll(req, res);

        expect(mockTarefas.findAll).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({
          fromCache: true,
          cacheTTL: 10,
          cacheTime: expect.any(Number),
          data: tarefas
        });
      });

      test('cache miss: busca no banco e grava no cache', async () => {
        const tarefas = [{ uuid: '1', titulo: 'Tarefa 1' }];
        cache.get.mockResolvedValue({ data: null, error: false });
        mockTarefas.findAll.mockResolvedValue(tarefas);

        const { findAll } = tarefasController();
        await findAll(req, res);

        expect(mockTarefas.findAll).toHaveBeenCalled();
        expect(cache.set).toHaveBeenCalledWith('tarefas:all', tarefas);
        expect(res.send).toHaveBeenCalledWith({
          fromCache: false,
          cacheTTL: 15,
          cacheError: false,
          dbTime: expect.any(Number),
          data: tarefas
        });
      });

      test('Redis indisponível: busca no banco e não grava no cache', async () => {
        const tarefas = [{ uuid: '1', titulo: 'Tarefa 1' }];
        cache.get.mockResolvedValue({ data: null, error: true });
        mockTarefas.findAll.mockResolvedValue(tarefas);

        const { findAll } = tarefasController();
        await findAll(req, res);

        expect(cache.set).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({ fromCache: false, cacheError: true, data: tarefas })
        );
      });
    });

    test('deve retornar erro 500 ao falhar', async () => {
      mockTarefas.findAll.mockRejectedValue(new Error('Erro no banco'));

      const { findAll } = tarefasController();
      await findAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Erro no banco'
      });
    });
  });

  describe('delete', () => {
    test('deve deletar uma tarefa com sucesso', async () => {
      req.params.uuid = '123';
      mockTarefas.destroy.mockResolvedValue(1);

      const { delete: deleteFn } = tarefasController();
      await deleteFn(req, res);

      expect(mockTarefas.destroy).toHaveBeenCalledWith({
        where: { uuid: '123' }
      });
      expect(res.send).toHaveBeenCalledWith({
        message: 'Tarefa deletada com sucesso.'
      });
    });

    test('deve retornar 404 quando tarefa não existe', async () => {
      req.params.uuid = '999';
      mockTarefas.destroy.mockResolvedValue(0);

      const { delete: deleteFn } = tarefasController();
      await deleteFn(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Tarefa não encontrada.'
      });
    });

    test('deve retornar erro 500 ao falhar', async () => {
      req.params.uuid = '123';
      mockTarefas.destroy.mockRejectedValue(new Error('Erro no banco'));

      const { delete: deleteFn } = tarefasController();
      await deleteFn(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Erro no banco'
      });
    });
  });

  describe('update_priority', () => {
    test('deve atualizar uma tarefa com sucesso', async () => {
      const tarefaAtualizada = { uuid: '123', importante: true };
      req.params.uuid = '123';
      req.body = { importante: true };
      mockTarefas.update.mockResolvedValue([1]);
      mockTarefas.findByPk.mockResolvedValue(tarefaAtualizada);

      const { update_priority } = tarefasController();
      await update_priority(req, res);

      expect(mockTarefas.update).toHaveBeenCalledWith(
        { importante: true },
        { where: { uuid: '123' } }
      );
      expect(res.send).toHaveBeenCalledWith(tarefaAtualizada);
    });

    test('deve retornar 404 quando tarefa não existe', async () => {
      req.params.uuid = '999';
      req.body = { importante: true };
      mockTarefas.update.mockResolvedValue([0]);
      mockTarefas.findByPk.mockResolvedValue(null);

      const { update_priority } = tarefasController();
      await update_priority(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Tarefa não encontrada.'
      });
    });

    test('deve retornar erro 500 ao falhar', async () => {
      req.params.uuid = '123';
      req.body = { importante: true };
      mockTarefas.update.mockRejectedValue(new Error('Erro no banco'));

      const { update_priority } = tarefasController();
      await update_priority(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Erro no banco'
      });
    });
  });

  describe('deleteAll', () => {
    test('deve apagar todas as tarefas e invalidar o cache', async () => {
      mockTarefas.destroy.mockResolvedValue(0);

      const { deleteAll } = tarefasController();
      await deleteAll(req, res);

      expect(mockTarefas.destroy).toHaveBeenCalledWith({ where: {}, truncate: true });
      expect(cache.del).toHaveBeenCalledWith('tarefas:all');
      expect(res.send).toHaveBeenCalledWith({ message: 'Todas as tarefas foram deletadas.' });
    });
  });
});
