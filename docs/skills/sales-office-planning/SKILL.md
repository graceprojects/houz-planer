---
name: sales-office-planning
description: Plan a sales office using the client's 200, 400 and 600 square metre programmes. Use when composing rooms, ready spaces, functional adjacencies or an accommodation schedule in HOUZ PLANER, or preparing a brief for its designer.
---

# Sales-office planning

Use the client's programme as a starting brief, then reconcile it with the actual building and edited requirements. Preserve existing layouts; create a separate variant before replacing their arrangement.

## Source and scope

Read the relevant rows in [the preserved client brief](../../references/sales-office-programme.ru.md). The typed implementation is [salesOffice.ts](../../../app/planner/salesOffice.ts); it is the single source of preset quantities, areas and adjacencies in the app. These are preliminary client benchmarks, not statutory minimums. The pasted text's foreign precedent claims and citation placeholders have not been independently verified; do not reuse them as factual evidence.

## Essential logic

1. Separate enclosed rooms, open functional zones and storage niches. Reception, waiting, coffee, model and children usually share a public hall. Do not surround every public function with partitions.
2. Follow the customer route: entrance → reception → model/presentation → sales manager → optional mortgage consultation → signing → exit. Keep the staff route and noisy call centre separate from client meetings.
3. A manager's office already includes meeting the customer. Do not add an extra meeting room per manager. The 600 m² basis has five manager offices, one VIP room usable for a sixth appointment, a shared meeting room, signing and two mortgage offices. Mortgage modules are consultation rooms, without cash handling.
4. At 200 m², the shared meeting room also supports signing and a visiting bank specialist by appointment. Director/support share a staff room; marketing and call centre are off-site. Some storage and technical functions are cabinets rather than rooms.
5. Place children within parents' sight from waiting, away from entrance traffic and hot drinks. Keep guest and staff toilets separate. Separate cleaning chemicals/equipment from kitchen, food and archive. Staff kitchen is for reheating and eating, not a production kitchen.
6. Consider the upper tier for team and service functions; keep the customer journey legible at ground level. Check the actual slab and stairs, not only the outer rectangle.

## Area accounting

- 200 m²: public 61 + sales 48 + team 14 + service 37 = 160 m² net.
- 400 m²: public 117 + sales 98 + team 50 + service 55 = 320 m² net.
- 600 m²: public 170 + sales 155 + team 73 + service 82 = 480 m² net.
- Starting circulation/wall reserve is 20% of gross: **gross = net / 0.8**, not net × 1.2. Internal circulation among each zone's furniture is already in that zone's area.
- Recalculate edited counts and areas with code. Do not silently keep the preset gross figure after edits.
- Outer floor contour, clear enclosed room area, and functional-zone area are different measurements. Zones sit inside physical rooms; never add both to the same total. Matching a gross budget is not proof a layout fits.

## Apply in HOUZ PLANER

Open **Пространства → Состав офиса**. Choose a programme, adjust quantities and area, review **Как связать зоны**, then save it. Use **На плане** to compare marked functions with the required counts.

Insert ready modules only on free floor. An enclosed module includes 150 mm walls, a 900 mm door and representative furniture; its displayed dimensions are clear inside dimensions. Open zones do not add walls. Whole-space transforms must carry walls, openings, tag and grouped furniture while preserving furniture dimensions. Individual furniture remains adjustable. Ungroup the space before editing its walls independently.

For an existing room, assign **Функция в составе офиса** instead of inserting duplicate walls. Do not infer that a large merged room is a manager office solely from an old label.

Use the shared operations in [spaceModules.ts](../../../app/planner/spaceModules.ts), preserve schema compatibility, and verify programme totals, group transforms, bounds, persistence and designer export. Sanitary/technical modules are representative area reservations, not detailed engineered room designs. Adjacency suggestions are guidance; the current app does not certify routes, accessibility, acoustics or regulatory compliance.

## Deliver

Provide the editable project and its programme alongside the designer brief. State what is placed and what is still required. Clearly distinguish a complete layout from a demonstration or a partially assembled variant.
