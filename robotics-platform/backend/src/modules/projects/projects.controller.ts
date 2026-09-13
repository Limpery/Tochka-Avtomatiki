import type { FastifyReply, FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import {
  createProcessSchema,
  createProjectSchema,
  processParamsSchema,
  updateProjectSchema,
} from '../../shared/schemas/projects'
import { getAuthUser } from '../../shared/utils/request'
import { projectsService } from './projects.service'

export const projectsController = {
  async list(request: FastifyRequest) {
    const user = getAuthUser(request)
    return projectsService.list(user.id)
  },

  async getById(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return projectsService.getById(user.id, id)
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthUser(request)
    const input = createProjectSchema.parse(request.body)
    const project = await projectsService.create(user.id, input)
    return reply.status(201).send(project)
  },

  async update(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    const input = updateProjectSchema.parse(request.body)
    return projectsService.update(user.id, id, input)
  },

  async remove(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return projectsService.remove(user.id, id)
  },

  async addProcess(request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    const input = createProcessSchema.parse(request.body)
    const process = await projectsService.addProcess(user.id, id, input)
    return reply.status(201).send(process)
  },

  async removeProcess(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id, processId } = processParamsSchema.parse(request.params)
    return projectsService.removeProcess(user.id, id, processId)
  },
}
