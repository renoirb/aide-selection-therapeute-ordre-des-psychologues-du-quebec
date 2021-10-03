import './style.css'

import { ordrePsyMembreIds } from './data'
import { onSelectChange, onClick, insertListItem } from './view'
import { localStorageAdapter, fromPsyIdToUrl } from './model'
import type { ISortFnPredicate, IPriseDeDecision } from './model'

const app = document.querySelector<HTMLDivElement>('#app')

/**
 * What will be the domains you want the Psychotherapist to have
 * experience treating?
 */
const currentUrl = new URL(window.location.href)
let domains = currentUrl.searchParams.getAll('domain').filter((i) => i !== '')
if (domains.length < 1) {
  // Just an example
  for (const suggested of ['anxiety', 'work-stress', 'burnout']) {
    currentUrl.searchParams.append('domain', suggested)
  }
  // Put your own by changing the URL after ?domain=foo&domain=bar
  window.location.href = currentUrl.href
}

if (app) {
  const idsNo = localStorageAdapter<string>('ids_no', window)
  const idsCandidate = localStorageAdapter<string>('ids_candidate', window)
  const checkboxes = localStorageAdapter<string>('checkboxes', window)

  // This function is defined here because we will mutate the current state coming from localStorageAdapter
  const onPriseDeDecision = (event: CustomEvent<IPriseDeDecision>) => {
    const { detail } = event
    if (detail.decision === 'candidate') {
      idsCandidate.add(detail.id)
    } else if (detail.decision === 'no') {
      idsNo.add(detail.id)
    } else if (/^maybe/.test(detail.decision) && detail.domain) {
      const subject = `${detail.domain}:${detail.id}`
      const maybeNot = detail.decision === 'maybe_not'
      if (maybeNot) {
        checkboxes.remove(subject)
      } else {
        checkboxes.add(subject)
      }
    }
  }

  const onDomNodeInserted = (event: MutationEvent) => {
    const { target, relatedNode } = event
    if (target && relatedNode) {
      const isUList = relatedNode.nodeName.toLowerCase() === 'ul'
      if (isUList) {
        const listItem = target as HTMLUListElement
        const { psyId = '' } = listItem.dataset ?? {}
        /**
         * Same as isInIdsNo condition in onClick.
         */
        const isInIdsNo = psyId !== '' && idsNo.items.includes(psyId)
        const selectedCheckboxes = checkboxes.items.filter(
          (i) => i.split(':')[1] === psyId,
        )
        if (isInIdsNo) {
          const fieldsetElement = listItem.querySelector('fieldset:first-child')
          fieldsetElement?.setAttribute('disabled', ' ')
          fieldsetElement?.setAttribute(
            'style',
            'text-decoration:line-through;',
          )
        }
        const parentNode = listItem.parentNode
        if (selectedCheckboxes.length > 0 && parentNode) {
          for (const reCheckCheckbox of selectedCheckboxes) {
            const inputCheckboxElement = parentNode.querySelector(
              `input[type=checkbox][name="${reCheckCheckbox}"]`,
            )
            if (inputCheckboxElement) {
              inputCheckboxElement.setAttribute('checked', '')
            }
          }
        }
      }
    }
  }

  // This function is defined here also because we will read from localStorageAdapter
  const sortFnCandidateFirst: ISortFnPredicate<string> = (
    left: string,
    right: string,
  ) => {
    const leftCheck = idsCandidate.items.includes(left)
    const rightCheck = idsCandidate.items.includes(right)
    // < than 0; when leftCheck is true, and not rightCheck
    const sortRightBeforeLeft = leftCheck === true && rightCheck === false
    // > than 0; when rightCheck is true, and not leftCheck
    const sortLeftBeforeRight = rightCheck === true && leftCheck === false
    const verdict = sortRightBeforeLeft ? -1 : sortLeftBeforeRight ? 1 : 0
    return verdict
  }

  const filteredOptions = (([...new Set(ordrePsyMembreIds)] ?? []) as string[])
    .sort()
    .filter((i) => !idsNo.items.includes(i))
    .filter((i) => !idsCandidate.items.includes(i))
    .sort((l, r) => sortFnCandidateFirst(r, l))

  const options = filteredOptions.map(
    (id) =>
      `<option value="${fromPsyIdToUrl(id)}">${id}${
        idsCandidate.items.includes(id) ? ' ** ' : ''
      }</option>`,
  )

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Aide à la sélection d’un psychologue de <a href="https://www.ordrepsy.qc.ca/" target=_blank>l’Ordre des psychologues du Québec</a></h1>
  <div>
    <label for="membres">Voir un membre: </label>
    <select id="membres"><option selected>...</option>${options}</select>&nbsp;&nbsp;<span><data id="count">${filteredOptions.length}</data> à voir</span>
  </div>
  `

  const form = document.createElement('form')
  form.setAttribute(
    'style',
    'margin:20px auto;max-width:800px;text-align:left;',
  )
  const htmlListElementToAppendTo = document.createElement('ul')
  htmlListElementToAppendTo.style.listStyleType = 'none'
  htmlListElementToAppendTo.style.padding = '0'
  htmlListElementToAppendTo.classList.add('container')
  form.appendChild(htmlListElementToAppendTo)
  document.querySelector<HTMLDivElement>('#app')!.appendChild(form)

  document.addEventListener('change', (e) =>
    onSelectChange(e, htmlListElementToAppendTo),
  )
  document.addEventListener('click', onClick)
  document.addEventListener('prise-de-decision', onPriseDeDecision)
  // @ts-expect-error - Should be using instead MutationObserver
  document.addEventListener('DOMNodeInserted', onDomNodeInserted, false)

  for (const idNo of idsNo.items) {
    insertListItem(htmlListElementToAppendTo, idNo)
  }
  for (const idCandidate of idsCandidate.items) {
    insertListItem(htmlListElementToAppendTo, idCandidate)
  }
}

declare global {
  interface DocumentEventMap {
    // https://open-wc.org/guides/knowledge/events/
    // https://github.com/WICG/webcomponents/issues/908
    readonly ['prise-de-decision']: CustomEvent<IPriseDeDecision>
  }
}
