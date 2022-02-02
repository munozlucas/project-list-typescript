import { DragTarget } from '../models/drag-drop'
import Component from './base-component'
import { autobind } from '../decorators/autobind'
import { Project, ProjectStatus } from '../models/project'
import { projectState } from '../state/project-state'
import ProjectItem from './project-item'

//ProjectList class
export default class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    const listEL = this.element.querySelector('ul')!
    listEL.classList.remove('droppable')
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer?.types[0] === 'text/plain') {
      event.preventDefault()
      const listEL = this.element.querySelector('ul')!
      listEL.classList.add('droppable')
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData('text/plain')
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Fishished
    )
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('drop', this.dropHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)

    projectState.addListener((projects: Project[]) => {
      const type = this.type === 'active' ? 0 : 1
      const relevantProjects = projects.filter((prj) => {
        return prj.status === type
      })
      this.assignedProjects = relevantProjects
      this.renderProjects()
    })
  }

  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement
    listEl.innerHTML = ''
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
    }
  }
}
