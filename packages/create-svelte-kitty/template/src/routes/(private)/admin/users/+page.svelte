<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { decodeTime } from 'ulid';
	import { t } from './i18n.ts';

	let { data } = $props();

	const f = createFormHelper();

	let checkedUsers = $state<string[]>([]);
</script>

<form method="post" use:enhance={f.submitFunction}>
	<nav class="flex flex-wrap gap-3 overflow-x-auto whitespace-nowrap">
		{#if !checkedUsers.length}
			{@const showActive = !data.showDeactivated}
			<a
				href={showActive ? '?deactivated' : '?'}
				role="switch"
				aria-checked={showActive}
				class="btn btn-xs btn-secondary flex items-center gap-x-1.5"
			>
				<span class="tw-checkbox" class:tw-checkbox-checked={showActive}></span>
				{t['active-users']}
			</a>
		{:else}
			<button type="reset" class="btn btn-xs btn-secondary">{t.reset}</button>
			<!-- Even if the button is hidden, the form can be submitted using the enter key. -->
			<!-- Therefore, JavaScript is used to remove the button when no rows are checked. -->
			<button
				formaction="?/deactivate"
				disabled={f.state === 'submitting'}
				class="btn btn-xs btn-danger disabled:btn-spinner"
			>
				{t.deactivate} ({checkedUsers.length})
			</button>
		{/if}
	</nav>
	{#if data.users.length}
		<div
			class="-mx-[--container-padding] mt-[--container-padding] overflow-x-auto border-y-[1px] border-gray-200 sm:mx-0 sm:rounded sm:border-[1px]"
		>
			<table class="divide-y divide-gray-300">
				<thead>
					<tr>
						{#if !data.showDeactivated}
							<th class="p-0"></th>
						{/if}
						<th class="text-left">{t.name}</th>
						<th class="text-left">{t.contact}</th>
						<th class="w-full text-left">
							{data.showDeactivated ? t['deactivated-at'] : t['joined-at']}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 hover:*:bg-gray-50 has-[:checked]:*:bg-gray-100">
					{#each data.users as user (user.id)}
						{@const date = data.showDeactivated
							? user.deactivatedAt
							: new Date(decodeTime(user.id))}
						<tr>
							{#if !data.showDeactivated}
								<td>
									<input
										bind:group={checkedUsers}
										type="checkbox"
										name="user-id"
										value={user.id}
										id={user.id}
									/>
								</td>
							{/if}
							<td>
								{#if user.profile}
									<label for={user.id}>
										{user.profile.givenName}
										{user.profile.surname}
									</label>
								{/if}
							</td>
							<td>{user.contact}</td>
							<td>
								{#if date}
									{@const datetime = date.toISOString()}
									<time {datetime}>{datetime.slice(0, 10)}</time>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</form>

<style lang="postcss">
	td {
		@apply empty:after:content-['-'];
		&:has(> input[type='checkbox']:first-child:last-child) {
			@apply pr-0 *:m-auto *:block;
		}
	}
</style>
