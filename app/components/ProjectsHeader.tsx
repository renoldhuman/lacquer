'use client'

import { useState } from 'react'
import { Capsule } from './Capsule'
import { NewProjectModal } from './NewProjectModal'

export function ProjectsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Projects
        </h1>
        <Capsule
          variant="project"
          as="button"
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer border-2 border-white dark:border-zinc-100"
        >
          + New Project
        </Capsule>
      </div>
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

