import {
  fromUrlToPsyId,
  dispatchPriseDeDecisionEvent,
  fromPsyIdToUrl,
  isVerdict,
} from './model'
import type { IPriseDeDecision } from './model'

const openedTabsMap = new Map<string, WindowProxy>()

export const onClick = (event: HTMLElementEventMap['click']) => {
  const targetElement = event.target as HTMLButtonElement | HTMLInputElement
  const isButton =
    targetElement && targetElement.tagName.toLowerCase() === 'button'
  const isInputCheckbox =
    targetElement &&
    targetElement.tagName.toLowerCase() === 'input' &&
    targetElement.type == 'checkbox'
  if (isButton === false && isInputCheckbox === false) {
    return
  }
  const { value } = targetElement
  const [decision, psyId] = String(value).split(':')
  if (isVerdict(decision) === false) {
    const message = `Invalid decision value "${decision}"`
    throw new Error(message)
  }
  /**
   * When it is a button, we will either want to set a "verdict"
   */
  if (isButton && isVerdict(decision)) {
    event.preventDefault()
    const detail = {
      id: psyId,
      decision,
    } as IPriseDeDecision
    dispatchPriseDeDecisionEvent(targetElement, detail)
    // Tight coupling, yup. But that isn't for re-use!
    let parentElement: HTMLFieldSetElement | HTMLLIElement =
      targetElement.parentElement as HTMLFieldSetElement | HTMLLIElement
    /**
     * Same as isInIdsNo condition in onDomNodeInserted
     */
    const isInIdsNo = detail.decision === 'no'
    if (isInIdsNo) {
      parentElement?.setAttribute('disabled', ' ')
      parentElement?.setAttribute('style', 'text-decoration:line-through;')
      const openedTabWindowRef = openedTabsMap.has(psyId)
        ? openedTabsMap.get(psyId)
        : null
      if (openedTabWindowRef) {
        openedTabsMap.delete(psyId)
        openedTabWindowRef.close()
      }
    }
  } else if (isInputCheckbox && /^maybe/.test(decision)) {
    const [domain, ...rest] = String(targetElement.name).split(':')
    const { checked = false } = targetElement as HTMLInputElement
    if (rest.length > 1) {
      const message = `You are playing with fire, are you?`
      throw new Error(message)
    }
    const detail = {
      id: psyId,
      decision: checked ? 'maybe' : 'maybe_not',
      domain,
    } as IPriseDeDecision
    dispatchPriseDeDecisionEvent(targetElement, detail)
  }
}

export const insertListItem = (hostList: HTMLUListElement, psyId: string) => {
  const psyUrl = fromPsyIdToUrl(psyId)
  const ownerDocument = hostList.ownerDocument
  const listItem = ownerDocument.createElement('li')
  listItem.dataset.psyId = psyId
  listItem.classList.add(...['mb-3', 'row'])
  // What are the specialities you want to consult for?
  // Yeah, this would be simpler using lit.dev, or Vue.
  // Also, value and name should not have double data, but whatever.
  const currentUrl = new URL(window.location.href)
  const domains = currentUrl.searchParams
    .getAll('domain')
    .filter((i) => i !== '')
  const checkBoxes = domains.map(
    (domain) =>
      `<input type=checkbox name="${domain}:${psyId}" value="maybe:${psyId}" title="${domain}" />`,
  )
  listItem.innerHTML = `
    <fieldset name="option-${psyId}">
      <button type="button" class="btn btn-light" value="no:${psyId}">Non</button>
      <button type="button" class="btn btn-light" value="candidate:${psyId}">Candidat</button>
      ${checkBoxes.join(' ')}
      <a href="${psyUrl}" target="_blank">${psyUrl}</a>
    </fieldset>
  `
  hostList.insertBefore(listItem, hostList.firstChild)
}

export const onSelectChange = (
  evt: HTMLElementEventMap['change'],
  htmlListElementToAppendTo: HTMLUListElement,
) => {
  const selectElement = evt.target as HTMLSelectElement
  if (selectElement.tagName.toLowerCase() !== 'select') {
    return
  }
  const { value = null } = selectElement
  const ownerDocument = selectElement.ownerDocument
  const defaultView = ownerDocument.defaultView
  if (!defaultView) {
    throw new Error(
      `Something unexpected that should not happen, happened. Kekchose que je sais pas.`,
    )
  }
  if (typeof value === 'string') {
    for (const opt of Array.from(selectElement.children)) {
      if (opt.getAttribute('value') === value) {
        selectElement.removeChild(opt)
      }
    }
    const psyId = fromUrlToPsyId(value)
    const w = defaultView.open(value, `prychologue-${psyId}`)
    if (w) {
      openedTabsMap.set(psyId, w)
    }
    insertListItem(htmlListElementToAppendTo, psyId)
    const countElement = selectElement.nextElementSibling // document.body.querySelector('#count')
    if (countElement) {
      const counting = Array.from(selectElement.children)
      countElement.textContent = String(counting.length - 1)
    }
  }
}
