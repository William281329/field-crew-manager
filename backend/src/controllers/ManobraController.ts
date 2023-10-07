import { Request, Response } from "express";
import manobraSchema from "../models/manobraSchema";
import equipamentSchema from "../models/equipamentSchema";

class ManobraController {
  public async createManobra(req: Request, res: Response) {
    try {
      const { titulo, descricao, equipamentos, funcionario, datetimeInicio, datetimeFim } = req.body;

      // Verificar se todos os campos obrigatórios estão presentes
      if (!titulo || !descricao || !equipamentos || !funcionario || !datetimeInicio) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      }

      // Verificar se pelo menos 1 equipamento foi informado
      if (equipamentos.length === 0) {
        return res.status(400).json({ error: 'Pelo menos um equipamento deve ser informado.' });
      }

      // Verificar se os IDs dos equipamentos são válidos
      const invalidEquipamentos = await Promise.all(
        equipamentos.map(async (equipamentoId) => {
          const equipamento = await equipamentSchema.findById(equipamentoId);
          return !equipamento;
        })
      );

      if (invalidEquipamentos.some((invalid) => invalid)) {
        return res.status(404).json({ error: 'Um ou mais IDs de equipamentos não foram encontrados.' });
      }

      // Criando a manobra
      const manobra = await manobraSchema.create({
        titulo,
        descricao,
        equipamentos,
        funcionario,
        datetimeInicio,
        datetimeFim,
      });

      return res.status(201).json({ id: manobra._id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  }
  public async finalizarManobra(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { datetimeFim } = req.body;

      // Verificar se o ID da manobra existe
      const manobra = await manobraSchema.findById(id);

      if (!manobra) {
        return res.status(404).json({ error: 'Manobra não encontrada.' });
      }

      // Defina a data e hora de término com base no que foi fornecido ou no momento atual
      const dataHoraFim = datetimeFim ? new Date(datetimeFim) : new Date();

      // Atualize a manobra com a data e hora de término
      await manobraSchema.findByIdAndUpdate(id, { datetimeFim: dataHoraFim });

      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  }
  public async editarManobra(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, equipamentos, dataHoraInicio, dataHoraFim, funcionario } = req.body;

      // Verificar se todos os campos obrigatórios estão presentes
      if (!titulo || !descricao || !equipamentos || !dataHoraInicio || !funcionario) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      }

      // Verificar se pelo menos 1 equipamento foi informado
      if (equipamentos.length === 0) {
        return res.status(400).json({ error: 'Pelo menos um equipamento deve ser informado.' });
      }

      // Verificar se os IDs dos equipamentos são válidos
      const invalidEquipamentos = await Promise.all(
        equipamentos.map(async (equipamentoId) => {
          const equipamento = await equipamentSchema.findById(equipamentoId);
          return !equipamento;
        })
      );

      if (invalidEquipamentos.some((invalid) => invalid)) {
        return res.status(404).json({ error: 'Um ou mais IDs de equipamentos não foram encontrados.' });
      }

      // Verificar se o ID da manobra existe
      const manobra = await manobraSchema.findById(id);

      if (!manobra) {
        return res.status(404).json({ error: 'Manobra não encontrada.' });
      }

      // Atualizar a manobra com os novos dados
      await manobraSchema.findByIdAndUpdate(id, {
        titulo,
        descricao,
        equipamentos,
        dataHoraInicio: new Date(dataHoraInicio),
        dataHoraFim: dataHoraFim ? new Date(dataHoraFim) : undefined,
        funcionario,
      });

      return res.status(200).json({ id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  }
}

export default new ManobraController();
