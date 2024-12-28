<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { Role } from '$lib/server/db/schema.ts';
	import formStyles from '$lib/styles/form.module.css';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { Modal } from 'svelte-html-modal';
	import { slide } from 'svelte/transition';
	import { t } from './i18n.ts';

	let { data, form } = $props();

	const fModal = createFormHelper({ updateOptions: { reset: false } });
	let isOpen = $state(false);
	const open = () => {
		// The `form` prop should not be updated on the close event
		// to avoid content changes during the closing transition.
		if (form?.userId) form = null;
		isOpen = true;
	};

	const fToggle = createFormHelper({
		onBeforeSubmit: ({ submitter }) => {
			if (submitter) submitter.ariaBusy = 'true';
		},
		onAfterSubmit: async ({ submitter, update }) => {
			await update({ invalidateAll: false });
			await invalidate('admin:roles');
			if (submitter) submitter.ariaBusy = 'false';
		}
	});
</script>

<div class="modal-wrapper">
	<Modal bind:isOpen closeOnBackdropClick={fModal.state !== 'submitting'}>
		<form
			method="post"
			use:enhance={fModal.submitFunction}
			class="{formStyles.stacked} {formStyles.underline} flex flex-col"
		>
			{#if !form || form.users?.length === 0}
				<h1 class="text-xl font-bold">{t['search-user']}</h1>
				<label class="mt-4">
					<span>{t['given-name']}</span>
					<input type="text" name="given-name" placeholder={t.john} pattern="\S.*" required />
				</label>
				{#if form?.users?.length === 0 && fModal.state !== 'submitting'}
					<p transition:slide class="mt-2 text-smallish text-red-800">
						{t['no-search-results']}
					</p>
				{/if}
				<button
					formaction="?/search"
					disabled={fModal.state === 'submitting'}
					class="btn btn-primary disabled:btn-spinner mt-4"
				>
					{t.search}
				</button>
			{:else if form.users?.length}
				<h1 class="text-xl font-bold">{t['assign-new-role']}</h1>
				<label class="mt-4">
					<span>{t.user}</span>
					<select name="user-id" class="truncate" required>
						{#each form.users as user (user.id)}
							<option value={user.id}>
								{user.profile.givenName}
								{user.profile.surname}
								({user.contact})
							</option>
						{/each}
					</select>
				</label>
				<label class="mt-4">
					<span>{t['new-role']}</span>
					<select name="role" required>
						<option value="admin">{t.admin}</option>
						<option value="superuser">{t.superuser}</option>
					</select>
				</label>
				<nav class="mt-4 flex gap-x-4">
					<button type="button" onclick={() => (form = null)} class="btn btn-secondary">
						{t['go-back']}
					</button>
					<button
						formaction="?/assign"
						disabled={fModal.state === 'submitting'}
						class="btn btn-primary disabled:btn-spinner flex-1"
					>
						{t['assign-role']}
					</button>
				</nav>
			{:else if form.userId}
				<h1 class="text-xl font-bold">{t['role-has-been-assigned']}</h1>
				<nav class="mt-4 flex gap-x-4">
					<button type="button" onclick={() => (form = null)} class="btn btn-secondary">
						{t['start-over']}
					</button>
					<a
						href="#{form.userId}"
						data-sveltekit-reload
						class="btn btn-primary flex-1"
						onclick={() => (isOpen = false)}
					>
						{t.close}
					</a>
				</nav>
			{/if}
		</form>
	</Modal>
</div>

<form method="post" use:enhance={fToggle.submitFunction}>
	<nav>
		<button type="button" onclick={open} class="btn btn-xs btn-secondary">
			{t['assign-new-role']}
		</button>
	</nav>
	{#if data.users.length}
		<fieldset
			disabled={fToggle.state === 'submitting'}
			class="-mx-[--container-padding] mt-[--container-padding] overflow-x-auto border-y-[1px] border-gray-200 sm:mx-0 sm:rounded sm:border-[1px]"
		>
			<table class="divide-y divide-gray-300">
				<thead>
					<tr>
						<th class="text-left">{t.name}</th>
						<th class="w-full text-left">{t.contact}</th>
						<th>{t.admin}</th>
						<th>{t.superuser}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 target:*:bg-yellow-50 hover:*:bg-gray-50">
					{#each data.users as user (user.id)}
						<tr id={user.id}>
							<td>
								{user.profile.givenName}
								{user.profile.surname}
							</td>
							<td>{user.contact}</td>
							<td>{@render toggle(user, 'admin')}</td>
							<td>{@render toggle(user, 'superuser')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</fieldset>
	{/if}
</form>

{#snippet toggle(user: (typeof data.users)[number], role: Role)}
	{@const isActive = user.roles.has(role)}
	{@const action = new URLSearchParams({ [!isActive ? '/assign' : '/revoke']: '', role })}
	<button
		formaction="?{action.toString()}"
		name="user-id"
		value={user.id}
		role="switch"
		aria-checked={isActive}
		aria-label={t[role]}
	>
	</button>
{/snippet}

<style>
	@import '$lib/theme.css' reference;

	.modal-wrapper > :global(dialog) {
		@apply w-80 rounded-md p-4 backdrop:backdrop-blur backdrop:backdrop-brightness-50;
	}

	button[role='switch'] {
		@apply m-auto;
		&:not([aria-busy='true']) {
			/* FIXME @apply tw-checkbox aria-checked:tw-checkbox-checked; */
			@apply block;
		}
		/* The `:global()` modifier is used to preserve the CSS. */
		/* Reference https://github.com/sveltejs/svelte/issues/1594 */
		&:global([aria-busy='true']) {
			/* FIXME @apply btn-spinner; */
		}
	}
</style>
