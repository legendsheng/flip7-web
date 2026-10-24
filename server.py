"""
Flip 7 - Real-Time Multiplayer Web Game Server
Zero external dependencies: Built with Python 3 standard library (asyncio, http, websockets RFC 6455).
"""

import asyncio
import base64
import hashlib
import json
import mimetypes
import os
import random
import struct
import sys
import time
import urllib.parse
from typing import Dict, List, Optional, Any, Tuple

WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

# ============================================================================
# Flip 7 Deck Definition
# ============================================================================

def build_deck() -> List[Dict[str, Any]]:
    deck = []
    card_id = 1
    
    # 1. Number cards:
    # 0: 1 card, 1: 1 card, 2: 2 cards, ..., 12: 12 cards (Total: 79 cards)
    deck.append({"id": f"num_{card_id}", "type": "number", "value": 0, "name": "0", "desc": "Value 0 (1 in deck)"})
    card_id += 1
    
    for val in range(1, 13):
        for copy_idx in range(val):
            deck.append({
                "id": f"num_{card_id}",
                "type": "number",
                "value": val,
                "name": str(val),
                "desc": f"Value {val} ({val} in deck)"
            })
            card_id += 1
            
    # 2. Modifier cards:
    # +2, +4, +6, +8, +10 (1 each = 5 cards) and x2 (1 card) = 6 cards
    for mod_val in [2, 4, 6, 8, 10]:
        deck.append({
            "id": f"mod_{card_id}",
            "type": "modifier",
            "value": mod_val,
            "mod_type": "add",
            "name": f"+{mod_val}",
            "desc": f"Adds {mod_val} bonus points"
        })
        card_id += 1
        
    # x2 card (1 card)
    deck.append({
        "id": f"mod_{card_id}",
        "type": "modifier",
        "value": 2,
        "mod_type": "multiply",
        "name": "x2",
        "desc": "Doubles number cards and bonuses!"
    })
    card_id += 1
    
    # 3. Action cards:
    # 3x Second Chance, 3x Freeze, 3x Flip Three (Total: 9 cards)
    for _ in range(3):
        deck.append({
            "id": f"act_{card_id}",
            "type": "action",
            "action": "second_chance",
            "name": "Second Chance",
            "desc": "Extra life: Shields against your next bust (one extra chance)"
        })
        card_id += 1
        
    for _ in range(3):
        deck.append({
            "id": f"act_{card_id}",
            "type": "action",
            "action": "freeze",
            "name": "Freeze",
            "desc": "Forces chosen player to Stay"
        })
        card_id += 1
        
    for _ in range(3):
        deck.append({
            "id": f"act_{card_id}",
            "type": "action",
            "action": "flip_three",
            "name": "Flip Three",
            "desc": "Chosen player must flip 3 cards"
        })
        card_id += 1
        
    random.shuffle(deck)
    return deck


# ============================================================================
# Bot Personalities
# ============================================================================

BOT_PROFILES = [
    {"name": "Lucky Lucy", "avatar": "🍀", "personality": "balanced"},
    {"name": "Risky Rick", "avatar": "🔥", "personality": "risk_taker"},
    {"name": "Careful Carl", "avatar": "💖", "personality": "cautious"},
    {"name": "Daring Dan", "avatar": "🎲", "personality": "risk_taker"},
    {"name": "Strategic Sam", "avatar": "🧠", "personality": "balanced"},
]


# ============================================================================
# WebSocket Protocol RFC 6455 Helpers
# ============================================================================

def make_ws_handshake_response(sec_key: str) -> bytes:
    accept_val = base64.b64encode(hashlib.sha1((sec_key + WS_GUID).encode("utf-8")).digest()).decode("utf-8")
    resp = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept_val}\r\n\r\n"
    )
    return resp.encode("utf-8")


def encode_ws_frame(message_text: str) -> bytes:
    data = message_text.encode("utf-8")
    length = len(data)
    frame = bytearray([0x81]) # FIN (0x80) + Text opcode (0x01)
    if length <= 125:
        frame.append(length)
    elif length <= 65535:
        frame.append(126)
        frame.extend(struct.pack("!H", length))
    else:
        frame.append(127)
        frame.extend(struct.pack("!Q", length))
    frame.extend(data)
    return bytes(frame)


def decode_ws_frame(buffer: bytearray) -> Tuple[Optional[int], Optional[bytes], int]:
    """
    Decodes one WebSocket frame from buffer.
    Returns (opcode, payload, bytes_consumed).
    If incomplete, returns (None, None, 0).
    """
    if len(buffer) < 2:
        return None, None, 0
    
    b0, b1 = buffer[0], buffer[1]
    fin = (b0 & 0x80) != 0
    opcode = b0 & 0x0F
    is_masked = (b1 & 0x80) != 0
    length = b1 & 0x7F
    offset = 2
    
    if length == 126:
        if len(buffer) < offset + 2:
            return None, None, 0
        length = struct.unpack("!H", buffer[offset:offset+2])[0]
        offset += 2
    elif length == 127:
        if len(buffer) < offset + 8:
            return None, None, 0
        length = struct.unpack("!Q", buffer[offset:offset+8])[0]
        offset += 8
        
    if is_masked:
        if len(buffer) < offset + 4:
            return None, None, 0
        mask = buffer[offset:offset+4]
        offset += 4
    else:
        mask = None
        
    if len(buffer) < offset + length:
        return None, None, 0
        
    payload = bytearray(buffer[offset:offset+length])
    if mask:
        for i in range(length):
            payload[i] ^= mask[i % 4]
            
    consumed = offset + length
    return opcode, bytes(payload), consumed


# ============================================================================
# Game Logic & State Management
# ============================================================================

INACTIVITY_TIMEOUT_SEC = 60

RANDOM_AVATARS = ["🦊", "🦁", "🐼", "🦅", "🐉", "🤖", "🎲", "💎", "🚀", "👑", "🍀", "🔥", "🐯", "🦄", "🐙", "🦉", "🦈", "🐺"]
RANDOM_NICKNAMES = [
    "幸运锦鲤", "王牌怪盗", "翻牌雀神", "欧皇本皇", "闪电快手", "冷静大师",
    "天选之子", "星际赌神", "神抽王", "逍遥浪客", "神秘大咖", "极速猎手",
    "深海巨鲨", "暗夜狐仙", "黄金狮子", "暴风飞龙"
]

def generate_random_profile(used_names: Optional[set] = None) -> Tuple[str, str]:
    avatar = random.choice(RANDOM_AVATARS)
    base_name = random.choice(RANDOM_NICKNAMES)
    name = f"{base_name}{random.randint(10, 99)}"
    if used_names:
        attempts = 0
        while name in used_names and attempts < 20:
            name = f"{random.choice(RANDOM_NICKNAMES)}{random.randint(10, 99)}"
            attempts += 1
    return name, avatar


class Player:
    def __init__(self, player_id: str, name: str, avatar: str, is_bot: bool = False, bot_personality: str = "balanced"):
        self.id = player_id
        self.name = name
        self.avatar = avatar
        self.is_bot = is_bot
        self.bot_personality = bot_personality
        self.total_score = 0
        self.is_connected = True
        self.is_auto_play = False
        self.joined_at = time.time()
        
        # Round state
        self.round_status = "active" # "active", "stayed", "frozen", "busted"
        self.number_cards: List[int] = []
        self.modifier_cards: List[Dict[str, Any]] = []
        self.hand_cards: List[Dict[str, Any]] = []
        self.has_second_chance = False
        self.second_chance_card: Optional[Dict[str, Any]] = None
        self.busted_card: Optional[Dict[str, Any]] = None
        self.flipped_seven = False
        self.round_score = 0

    def reset_for_round(self):
        self.round_status = "active"
        self.number_cards = []
        self.modifier_cards = []
        self.hand_cards = []
        self.has_second_chance = False
        self.second_chance_card = None
        self.busted_card = None
        self.flipped_seven = False
        self.round_score = 0

    def compute_round_score(self) -> int:
        if self.round_status == "busted":
            self.round_score = 0
            return 0
        num_sum = sum(self.number_cards)
        has_x2 = any(m.get("name") == "x2" for m in self.modifier_cards)
        mods = sum(m.get("value", 0) for m in self.modifier_cards if m.get("mod_type") == "add")
        bonus = 15 if len(self.number_cards) >= 7 else 0
        self.round_score = ((num_sum + mods) * (2 if has_x2 else 1)) + bonus
        return self.round_score

    def to_dict(self) -> Dict[str, Any]:
        self.compute_round_score()
        return {
            "id": self.id,
            "name": self.name,
            "avatar": self.avatar,
            "isBot": self.is_bot,
            "isAutoPlay": self.is_auto_play,
            "botPersonality": self.bot_personality,
            "totalScore": self.total_score,
            "roundScore": self.round_score,
            "roundStatus": self.round_status,
            "numberCards": self.number_cards,
            "modifierCards": self.modifier_cards,
            "bustedCard": self.busted_card,
            "hasSecondChance": self.has_second_chance,
            "flippedSeven": len(self.number_cards) >= 7,
            "isConnected": self.is_connected
        }


class Room:
    def __init__(self, code: str, host_id: str, target_score: int = 200, show_odds: bool = True):
        self.code = code
        self.host_id = host_id
        self.target_score = target_score
        self.show_odds = show_odds
        self.state = "lobby" # "lobby", "playing", "round_recap", "game_over"
        self.players: List[Player] = []
        self.deck: List[Dict[str, Any]] = []
        self.discard_pile: List[Dict[str, Any]] = []
        self.dealer_index = 0
        self.current_turn_index = 0
        self.round_number = 0
        self.last_card_drawn: Optional[Dict[str, Any]] = None
        self.last_draw_result: Optional[Dict[str, Any]] = None
        self.pending_target: Optional[Dict[str, Any]] = None
        self.flip_three_queue: Optional[Dict[str, Any]] = None
        self.is_sequence_busy: bool = False
        self.full_match_log: List[str] = []
        self.game_log: List[str] = []
        self.winner: Optional[Player] = None
        self.clients: Dict[str, Any] = {} # player_id -> WebSocketClient
        self.bot_task: Optional[asyncio.Task] = None
        self.timeout_task: Optional[asyncio.Task] = None
        self.empty_destroy_task: Optional[asyncio.Task] = None
        self.turn_deadline: Optional[float] = None
        self.recap_deadline: Optional[float] = None
        self.created_at: float = time.time()
        self.is_destroyed: bool = False

    def has_any_humans(self) -> bool:
        return any(not p.is_bot for p in self.players)

    def has_connected_humans(self) -> bool:
        return any(not p.is_bot and p.is_connected for p in self.players)

    def destroy(self):
        if self.is_destroyed:
            return
        self.is_destroyed = True
        self.state = "destroyed"
        for task in (self.timeout_task, self.bot_task, self.empty_destroy_task):
            if task and not task.done():
                task.cancel()
        self.timeout_task = None
        self.bot_task = None
        self.empty_destroy_task = None
        self.clients.clear()
        ROOMS.pop(self.code, None)

    def check_empty_and_cleanup(self, immediate_if_no_connected: bool = False) -> bool:
        if self.is_destroyed:
            return True
        if not self.has_any_humans():
            self.destroy()
            return True
        if not self.has_connected_humans():
            if immediate_if_no_connected:
                self.destroy()
                return True
            # Pause active timers/bots while 0 humans are connected
            if self.timeout_task and not self.timeout_task.done():
                self.timeout_task.cancel()
            self.turn_deadline = None
            if not self.empty_destroy_task or self.empty_destroy_task.done():
                # Give 15s grace period for F5 page refresh; if nobody reconnects, destroy room
                self.empty_destroy_task = asyncio.create_task(self.watch_empty_room_destroy(15.0))
            return False
        else:
            if self.empty_destroy_task and not self.empty_destroy_task.done():
                self.empty_destroy_task.cancel()
                self.empty_destroy_task = None
            return False

    async def watch_empty_room_destroy(self, delay: float = 15.0):
        try:
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            return
        if not self.is_destroyed and not self.has_connected_humans():
            self.destroy()

    def to_summary_dict(self) -> Dict[str, Any]:
        host_p = self.get_player(self.host_id) or (self.players[0] if self.players else None)
        humans = [p for p in self.players if not p.is_bot]
        connected_humans = [p for p in humans if p.is_connected]
        bots = [p for p in self.players if p.is_bot]
        return {
            "roomCode": self.code,
            "state": self.state,
            "roundNumber": self.round_number,
            "targetScore": self.target_score,
            "showOdds": self.show_odds,
            "hostName": host_p.name if host_p else "Unknown",
            "hostAvatar": host_p.avatar if host_p else "👑",
            "humanCount": len(humans),
            "connectedHumanCount": len(connected_humans),
            "botCount": len(bots),
            "totalPlayers": len(self.players),
            "maxPlayers": 12,
            "hasOfflineSeat": len(connected_humans) < len(humans),
            "createdAt": self.created_at
        }

    def log(self, message: str):
        ts = time.strftime("%H:%M:%S")
        self.full_match_log.append(f"[{ts}] {message}")
        if len(self.full_match_log) > 600:
            self.full_match_log.pop(0)

        self.game_log.append(message)
        if len(self.game_log) > 600:
            self.game_log.pop(0)

    def get_player(self, player_id: str) -> Optional[Player]:
        for p in self.players:
            if p.id == player_id:
                return p
        return None

    def get_active_players(self) -> List[Player]:
        return [p for p in self.players if p.round_status == "active"]

    def current_player(self) -> Optional[Player]:
        if not self.players or self.state != "playing":
            return None
        if 0 <= self.current_turn_index < len(self.players):
            return self.players[self.current_turn_index]
        return None

    def draw_card(self) -> Dict[str, Any]:
        if not self.deck:
            if self.discard_pile:
                self.deck = self.discard_pile[:]
                self.discard_pile = []
                random.shuffle(self.deck)
                self.log("🔀 Discard pile reshuffled into draw deck.")
            else:
                self.deck = build_deck()
                self.log("🔀 Brand new deck shuffled.")
        return self.deck.pop()

    def advance_turn(self):
        active = self.get_active_players()
        if not active:
            self.end_round()
            return
        
        # Advance to next active player
        n = len(self.players)
        for step in range(1, n + 1):
            next_idx = (self.current_turn_index + step) % n
            if self.players[next_idx].round_status == "active":
                self.current_turn_index = next_idx
                break
        else:
            self.end_round()
            return

        self.schedule_bot_if_needed()

    def start_game(self):
        self.state = "playing"
        self.round_number = 0
        self.deck = build_deck()
        self.discard_pile = []
        for p in self.players:
            p.total_score = 0
        self.dealer_index = 0
        self.start_new_round()

    def start_new_round(self):
        if self.timeout_task and not self.timeout_task.done():
            self.timeout_task.cancel()
        if self.bot_task and not self.bot_task.done():
            self.bot_task.cancel()
            self.bot_task = None
        self.recap_deadline = None
        self.turn_deadline = None
        self.round_number += 1
        self.state = "playing"
        self.last_card_drawn = None
        self.last_draw_result = None
        self.pending_target = None
        self.flip_three_queue = None
        
        # Discard all remaining cards in players' hands to discard_pile
        for p in self.players:
            if hasattr(p, 'hand_cards') and p.hand_cards:
                self.discard_pile.extend(p.hand_cards)
            if hasattr(p, 'second_chance_card') and p.second_chance_card:
                self.discard_pile.append(p.second_chance_card)
            p.reset_for_round()
            
        # First player to act is the one after the dealer
        if len(self.players) > 0:
            self.current_turn_index = (self.dealer_index + 1) % len(self.players)
            
        dealer = self.players[self.dealer_index] if self.players else None
        dealer_name = dealer.name if dealer else "None"
        self.log(f"🔔 --- Round {self.round_number} Begins! Dealer: {dealer_name} ---")
        self.schedule_bot_if_needed()

    def end_round(self, reason: str = ""):
        if self.timeout_task and not self.timeout_task.done():
            self.timeout_task.cancel()
        if self.bot_task and not self.bot_task.done():
            self.bot_task.cancel()
            self.bot_task = None
        self.turn_deadline = None
        self.recap_deadline = None
        self.state = "round_recap"
        recap_info = []
        for p in self.players:
            round_pts = p.compute_round_score()
            p.total_score += round_pts
            status_text = "BUSTED" if p.round_status == "busted" else f"+{round_pts} pts"
            recap_info.append(f"{p.name}: {status_text} (Total: {p.total_score})")
            
        self.log(f"🏁 Round {self.round_number} Finished! " + (f"({reason}) " if reason else "") + " | ".join(recap_info))
        
        # Check if anyone reached target score
        high_scorers = [p for p in self.players if p.total_score >= self.target_score]
        if high_scorers:
            self.state = "game_over"
            self.winner = max(self.players, key=lambda p: p.total_score)
            self.log(f"🏆 GAME OVER! {self.winner.name} won the game with {self.winner.total_score} points!")
        else:
            # Rotate dealer
            if self.players:
                self.dealer_index = (self.dealer_index + 1) % len(self.players)
            # 10s auto-start next round countdown if dealer/host does not click Next Round
            recap_delay = 10.0
            self.recap_deadline = time.time() + recap_delay
            self.timeout_task = asyncio.create_task(self.watch_recap_timeout(self.round_number, recap_delay))

    def handle_hit(self, player: Player) -> Dict[str, Any]:
        """Draws a card for the player and evaluates outcomes."""
        if self.is_sequence_busy:
            return {"success": False, "error": "Dealing sequence in progress"}
        if player.round_status != "active":
            return {"success": False, "error": "Player is not active"}
            
        card = self.draw_card()
        self.last_card_drawn = card
        result = {"card": card, "player": player.id}
        
        if card["type"] == "number":
            num_val = card["value"]
            if num_val in player.number_cards:
                # Duplicate!
                if player.has_second_chance:
                    # Shield saved the player!
                    player.has_second_chance = False
                    self.discard_pile.append(card)
                    if hasattr(player, 'second_chance_card') and player.second_chance_card:
                        self.discard_pile.append(player.second_chance_card)
                        player.second_chance_card = None
                    result["outcome"] = "shield_saved"
                    result["duplicate"] = num_val
                    self.log(f"❤️ {player.name} drew duplicate {num_val}, but Extra Life HEART saved them! Extra life used.")
                else:
                    # Bust!
                    player.round_status = "busted"
                    player.busted_card = card
                    self.discard_pile.append(card)
                    if hasattr(player, 'hand_cards') and player.hand_cards:
                        self.discard_pile.extend(player.hand_cards)
                        player.hand_cards = []
                    if hasattr(player, 'second_chance_card') and player.second_chance_card:
                        self.discard_pile.append(player.second_chance_card)
                        player.second_chance_card = None
                    result["outcome"] = "busted"
                    result["duplicate"] = num_val
                    self.log(f"💥 {player.name} drew duplicate {num_val} and BUSTED! (0 pts this round)")
            else:
                # Safe unique number
                player.number_cards.append(num_val)
                player.hand_cards.append(card)
                result["outcome"] = "safe_number"
                self.log(f"🃏 {player.name} hit and flipped {num_val}! (Total cards: {len(player.number_cards)})")
                
                # Check for FLIP 7!
                if len(player.number_cards) >= 7:
                    player.flipped_seven = True
                    result["outcome"] = "flip_seven"
                    self.log(f"🌟🎉 FLIP 7! {player.name} flipped 7 unique numbers! +15 BONUS POINTS! Round concludes!")
                    self.last_draw_result = result
                    self.end_round(reason=f"{player.name} achieved FLIP 7!")
                    return {"success": True, "result": result}
                    
        elif card["type"] == "modifier":
            player.modifier_cards.append(card)
            player.hand_cards.append(card)
            result["outcome"] = "modifier"
            self.log(f"✨ {player.name} flipped modifier card {card['name']}! ({card['desc']})")
            
        elif card["type"] == "action":
            act = card["action"]
            if act == "second_chance":
                if not player.has_second_chance:
                    player.has_second_chance = True
                    player.second_chance_card = card
                    result["outcome"] = "second_chance_gained"
                    self.log(f"❤️ {player.name} gained an Extra Life heart (+1 Life)!")
                else:
                    # Player already has one, must gift it to another active player without one
                    candidates = [p for p in self.get_active_players() if p.id != player.id and not p.has_second_chance]
                    if candidates:
                        self.pending_target = {
                            "type": "GIFT_SECOND_CHANCE",
                            "source_id": player.id,
                            "card": card,
                            "valid_targets": [p.id for p in candidates]
                        }
                        result["outcome"] = "pending_gift"
                        self.last_draw_result = result
                        self.schedule_bot_if_needed()
                        return {"success": True, "result": result}
                    else:
                        self.discard_pile.append(card)
                        result["outcome"] = "second_chance_discarded"
                        self.log(f"❤️ Second Chance discarded (all active players already have extra lives).")
                        
            elif act == "freeze":
                active_others = self.get_active_players()
                if active_others:
                    self.pending_target = {
                        "type": "TARGET_FREEZE",
                        "source_id": player.id,
                        "card": card,
                        "valid_targets": [p.id for p in active_others]
                    }
                    result["outcome"] = "pending_freeze"
                    self.last_draw_result = result
                    self.schedule_bot_if_needed()
                    return {"success": True, "result": result}
                else:
                    self.discard_pile.append(card)
                    result["outcome"] = "action_discarded"
                    
            elif act == "flip_three":
                active_players = self.get_active_players()
                if active_players:
                    self.pending_target = {
                        "type": "TARGET_FLIP_THREE",
                        "source_id": player.id,
                        "card": card,
                        "valid_targets": [p.id for p in active_players]
                    }
                    result["outcome"] = "pending_flip_three"
                    self.last_draw_result = result
                    self.schedule_bot_if_needed()
                    return {"success": True, "result": result}
                else:
                    self.discard_pile.append(card)
                    result["outcome"] = "action_discarded"
                    
        self.last_draw_result = result
        
        # Advance turn if not waiting on target
        if not self.pending_target and self.state == "playing":
            self.advance_turn()
            
        return {"success": True, "result": result}

    def handle_stay(self, player: Player) -> Dict[str, Any]:
        if self.is_sequence_busy:
            return {"success": False, "error": "Dealing sequence in progress"}
        if player.round_status != "active":
            return {"success": False, "error": "Player is not active"}
            
        self.last_card_drawn = None
        player.round_status = "stayed"
        pts = player.compute_round_score()
        self.log(f"🛑 {player.name} stayed and banked {pts} points!")
        self.advance_turn()
        return {"success": True}

    def resolve_target_selection(self, target_player_id: str):
        if not self.pending_target:
            return
            
        act_type = self.pending_target["type"]
        source_id = self.pending_target["source_id"]
        source = self.get_player(source_id)
        target = self.get_player(target_player_id)
        
        if not target or target_player_id not in self.pending_target["valid_targets"]:
            # Fallback to first valid target
            valid = self.pending_target["valid_targets"]
            if valid:
                target = self.get_player(valid[0])
            else:
                self.pending_target = None
                self.advance_turn()
                return

        source_name = source.name if source else "Player"
        target_name = target.name if target else "Target"
        act_card = self.pending_target.get("card")
        
        if act_type == "TARGET_FREEZE":
            target.round_status = "frozen"
            if act_card:
                self.discard_pile.append(act_card)
            pts = target.compute_round_score()
            self.log(f"❄️ {source_name} FROZE {target_name}! {target_name}'s hand is locked at {pts} points!")
            self.pending_target = None
            self.advance_turn()
            
        elif act_type == "GIFT_SECOND_CHANCE":
            target.has_second_chance = True
            target.second_chance_card = act_card
            self.log(f"🎁 {source_name} gifted an Extra Life heart to {target_name}!")
            self.pending_target = None
            self.advance_turn()
            
        elif act_type == "TARGET_FLIP_THREE":
            if act_card:
                self.discard_pile.append(act_card)
            self.log(f"⚡ {source_name} 对 {target_name} 发动了【连翻三张】！开始连续发牌...")
            self.pending_target = None
            if self.timeout_task and not self.timeout_task.done():
                self.timeout_task.cancel()
            self.turn_deadline = None
            self.is_sequence_busy = True
            self.broadcast_state()
            # Queue 3 flips for target
            asyncio.create_task(self.run_flip_three_sequence(target))

    async def run_flip_three_sequence(self, target: Player):
        """Deals 3 cards to target sequentially with brief dramatic pauses."""
        self.is_sequence_busy = True
        try:
            for flip_num in range(1, 4):
                if self.state != "playing" or target.round_status != "active":
                    break
                await asyncio.sleep(1.1)
                self.log(f"💥 Flip Three #{flip_num} for {target.name}:")
                # Draw card as target
                card = self.draw_card()
                self.last_card_drawn = card
                result = {"card": card, "player": target.id, "flip_three_step": flip_num}
                
                if card["type"] == "number":
                    num = card["value"]
                    if num in target.number_cards:
                        if target.has_second_chance:
                            target.has_second_chance = False
                            self.discard_pile.append(card)
                            if hasattr(target, 'second_chance_card') and target.second_chance_card:
                                self.discard_pile.append(target.second_chance_card)
                                target.second_chance_card = None
                            result["outcome"] = "shield_saved"
                            self.log(f"❤️ Flip Three duplicate {num}! Extra life heart saved {target.name}!")
                        else:
                            target.round_status = "busted"
                            target.busted_card = card
                            self.discard_pile.append(card)
                            if hasattr(target, 'hand_cards') and target.hand_cards:
                                self.discard_pile.extend(target.hand_cards)
                                target.hand_cards = []
                            if hasattr(target, 'second_chance_card') and target.second_chance_card:
                                self.discard_pile.append(target.second_chance_card)
                                target.second_chance_card = None
                            result["outcome"] = "busted"
                            self.log(f"💥 Flip Three duplicate {num}! {target.name} BUSTED!")
                            self.last_draw_result = result
                            self.broadcast_state()
                            break
                    else:
                        target.number_cards.append(num)
                        target.hand_cards.append(card)
                        result["outcome"] = "safe_number"
                        self.log(f"🃏 Flip Three #{flip_num}: Safe {num}!")
                        if len(target.number_cards) >= 7:
                            target.flipped_seven = True
                            result["outcome"] = "flip_seven"
                            self.log(f"🌟🎉 FLIP 7 during Flip Three! {target.name} flips 7! Round concludes!")
                            self.last_draw_result = result
                            self.broadcast_state()
                            self.end_round(reason=f"{target.name} achieved FLIP 7!")
                            self.broadcast_state()
                            return
                elif card["type"] == "modifier":
                    target.modifier_cards.append(card)
                    target.hand_cards.append(card)
                    result["outcome"] = "modifier"
                    self.log(f"✨ Flip Three #{flip_num}: Modifier {card['name']}!")
                elif card["type"] == "action":
                    # For action cards drawn during Flip 3, apply them simply:
                    if card["action"] == "second_chance" and not target.has_second_chance:
                        target.has_second_chance = True
                        target.second_chance_card = card
                        result["outcome"] = "second_chance_gained"
                        self.log(f"❤️ Flip Three #{flip_num}: Extra life gained!")
                    else:
                        self.discard_pile.append(card)
                        result["outcome"] = "action_discarded"
                        self.log(f"Flip Three #{flip_num}: Action {card['name']} (auto-discarded during Flip 3).")
                        
                self.last_draw_result = result
                self.broadcast_state()
                
            await asyncio.sleep(0.8)
            if self.state == "playing":
                self.advance_turn()
                self.broadcast_state()
        finally:
            self.is_sequence_busy = False
            self.broadcast_state()

    def calculate_deck_stats(self, for_player: Optional[Player]) -> Dict[str, Any]:
        """Calculates probabilities and card counts."""
        total_remaining = len(self.deck)
        # If draw deck is empty, next draw will reshuffle discard_pile
        source_pile = self.deck if total_remaining > 0 else self.discard_pile
        effective_total = len(source_pile)
        if effective_total == 0:
            return {
                "totalRemaining": 0,
                "discardCount": len(self.discard_pile),
                "duplicatesInDeck": 0,
                "bustRiskPct": 0
            }
            
        duplicates_count = 0
        if for_player and for_player.number_cards:
            user_nums = set(for_player.number_cards)
            for c in source_pile:
                if c["type"] == "number" and c["value"] in user_nums:
                    duplicates_count += 1
                    
        bust_pct = round((duplicates_count / effective_total) * 100, 1) if effective_total > 0 else 0
        return {
            "totalRemaining": total_remaining,
            "discardCount": len(self.discard_pile),
            "duplicatesInDeck": duplicates_count,
            "bustRiskPct": bust_pct
        }

    def get_active_actor(self) -> Optional[Player]:
        if self.state != "playing":
            return None
        if self.pending_target:
            return self.get_player(self.pending_target.get("source_id", ""))
        return self.current_player()

    def to_dict(self, for_player_id: Optional[str] = None) -> Dict[str, Any]:
        cur_p = self.current_player()
        target_p = self.get_player(for_player_id) if for_player_id else cur_p
        actor = self.get_active_actor()
        
        return {
            "roomCode": self.code,
            "hostId": self.host_id,
            "targetScore": self.target_score,
            "showOdds": self.show_odds,
            "state": self.state,
            "roundNumber": self.round_number,
            "dealerId": self.players[self.dealer_index].id if self.players else None,
            "currentTurnPlayerId": cur_p.id if cur_p else None,
            "activeActorId": actor.id if actor else None,
            "turnDeadline": self.turn_deadline,
            "recapDeadline": self.recap_deadline,
            "serverTime": time.time(),
            "isSequenceBusy": self.is_sequence_busy,
            "players": [p.to_dict() for p in self.players],
            "lastCardDrawn": self.last_card_drawn,
            "lastDrawResult": self.last_draw_result,
            "pendingTarget": self.pending_target,
            "deckStats": self.calculate_deck_stats(target_p),
            "gameLog": self.game_log,
            "winner": self.winner.to_dict() if self.winner else None
        }

    def broadcast_state(self):
        for pid, client in list(self.clients.items()):
            try:
                state_data = self.to_dict(for_player_id=pid)
                msg = json.dumps({"type": "STATE_UPDATE", "data": state_data})
                client.send_text(msg)
            except Exception as e:
                pass

    def schedule_bot_if_needed(self):
        if self.timeout_task and not self.timeout_task.done():
            self.timeout_task.cancel()
        if self.bot_task and not self.bot_task.done():
            self.bot_task.cancel()
            self.bot_task = None
        self.turn_deadline = None

        if self.is_destroyed or self.state != "playing" or not self.has_connected_humans():
            return
            
        # Check if pending target requires bot / auto-play action
        if self.pending_target:
            source = self.get_player(self.pending_target["source_id"])
            if source:
                if source.is_bot or source.is_auto_play:
                    self.bot_task = asyncio.create_task(self.run_bot_target_action(source))
                else:
                    self.turn_deadline = time.time() + INACTIVITY_TIMEOUT_SEC
                    self.timeout_task = asyncio.create_task(
                        self.watch_inactivity_timeout(source.id, self.turn_deadline)
                    )
            return
            
        cur_p = self.current_player()
        if cur_p and cur_p.round_status == "active":
            if cur_p.is_bot or cur_p.is_auto_play:
                self.bot_task = asyncio.create_task(self.run_bot_turn(cur_p))
            else:
                self.turn_deadline = time.time() + INACTIVITY_TIMEOUT_SEC
                self.timeout_task = asyncio.create_task(
                    self.watch_inactivity_timeout(cur_p.id, self.turn_deadline)
                )

    async def watch_inactivity_timeout(self, player_id: str, deadline: float):
        try:
            delay = max(0.1, deadline - time.time())
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            return

        if self.state != "playing" or self.turn_deadline != deadline:
            return

        actor = self.get_active_actor()
        if not actor or actor.id != player_id or actor.is_bot or actor.is_auto_play:
            return

        actor.is_auto_play = True
        self.turn_deadline = None
        self.log(f"🤖 {actor.name} 超过 {INACTIVITY_TIMEOUT_SEC} 秒未行动，已自动进入 AI 托管模式！")
        self.broadcast_state()
        self.schedule_bot_if_needed()

    async def watch_recap_timeout(self, round_num: int, delay: float):
        try:
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            return
        if not self.is_destroyed and self.state == "round_recap" and self.round_number == round_num and self.has_connected_humans():
            self.log("⏱️ 10秒倒计时结束，自动开启下一轮！")
            self.start_new_round()
            self.broadcast_state()

    async def run_bot_target_action(self, bot: Player):
        await asyncio.sleep(random.uniform(1.0, 1.8))
        if not self.pending_target or self.pending_target["source_id"] != bot.id:
            return
        if not (bot.is_bot or bot.is_auto_play):
            return
            
        valid = self.pending_target["valid_targets"]
        if not valid:
            self.pending_target = None
            self.advance_turn()
            self.broadcast_state()
            return
            
        act_type = self.pending_target["type"]
        target_id = valid[0]
        
        if act_type == "TARGET_FREEZE":
            # Freeze the opponent with highest current round score or total score
            opponents = [self.get_player(pid) for pid in valid if pid != bot.id]
            if opponents:
                best_opp = max(opponents, key=lambda p: (len(p.number_cards), p.round_score, p.total_score))
                target_id = best_opp.id
            else:
                target_id = valid[0]
                
        elif act_type == "TARGET_FLIP_THREE":
            # If bot has shield and wants points, target self; otherwise target highest opponent
            if bot.has_second_chance and bot.id in valid and len(bot.number_cards) <= 4:
                target_id = bot.id
            else:
                opponents = [self.get_player(pid) for pid in valid if pid != bot.id]
                if opponents:
                    # Target opponent with 4-5 cards (most likely to bust!)
                    best_opp = max(opponents, key=lambda p: len(p.number_cards))
                    target_id = best_opp.id
                else:
                    target_id = valid[0]
                    
        elif act_type == "GIFT_SECOND_CHANCE":
            # Gift to opponent with lowest score
            opponents = [self.get_player(pid) for pid in valid if pid != bot.id]
            if opponents:
                target_id = min(opponents, key=lambda p: p.total_score).id
            else:
                target_id = valid[0]
                
        self.resolve_target_selection(target_id)
        self.broadcast_state()

    async def run_bot_turn(self, bot: Player):
        # Human-like delay
        delay = random.uniform(1.2, 2.2)
        await asyncio.sleep(delay)
        
        cur = self.current_player()
        if not cur or cur.id != bot.id or cur.round_status != "active" or self.state != "playing":
            return
        if not (bot.is_bot or bot.is_auto_play):
            return
            
        # Decision logic
        deck_stats = self.calculate_deck_stats(bot)
        bust_risk = deck_stats.get("bustRiskPct", 0)
        num_cards = len(bot.number_cards)
        pts = bot.compute_round_score()
        
        should_hit = True
        
        if num_cards == 0:
            should_hit = True
        elif num_cards == 6:
            # 1 card away from FLIP 7! High reward!
            if bot.has_second_chance or bust_risk < 50 or bot.bot_personality == "risk_taker":
                should_hit = True
            else:
                should_hit = (random.random() < 0.45)
        else:
            if bot.bot_personality == "cautious":
                if pts >= 22 or (num_cards >= 4 and bust_risk > 25 and not bot.has_second_chance):
                    should_hit = False
            elif bot.bot_personality == "risk_taker":
                if pts >= 45 and bust_risk > 50 and not bot.has_second_chance:
                    should_hit = False
                elif bust_risk > 65 and not bot.has_second_chance:
                    should_hit = False
            else: # balanced
                if bot.has_second_chance:
                    should_hit = True
                elif pts >= 30 and bust_risk > 38:
                    should_hit = False
                elif bust_risk > 45:
                    should_hit = False
                    
        if should_hit:
            self.handle_hit(bot)
        else:
            self.handle_stay(bot)
            
        self.broadcast_state()


# Global Rooms store
ROOMS: Dict[str, Room] = {}

def generate_room_code() -> str:
    letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    while True:
        code = "".join(random.choice(letters) for _ in range(4))
        if code not in ROOMS:
            return code

def get_rooms_summary_list() -> List[Dict[str, Any]]:
    # Prune destroyed or completely human-less rooms first
    to_remove = [code for code, r in list(ROOMS.items()) if r.is_destroyed or not r.has_any_humans()]
    for code in to_remove:
        r = ROOMS.pop(code, None)
        if r and not r.is_destroyed:
            r.destroy()
    rooms_list = [r.to_summary_dict() for r in ROOMS.values() if not r.is_destroyed]
    rooms_list.sort(key=lambda x: x.get("createdAt", 0), reverse=True)
    return rooms_list


# ============================================================================
# Client Connection & Protocol Handling
# ============================================================================

class WebSocketClient:
    def __init__(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        self.reader = reader
        self.writer = writer
        self.buffer = bytearray()
        self.player_id: Optional[str] = None
        self.room_code: Optional[str] = None
        self.is_closed = False
        self.last_msg_times: Dict[str, float] = {}

    def is_rate_limited(self, mtype: str, cooldown: float = 0.5) -> bool:
        now = time.time()
        last = self.last_msg_times.get(mtype, 0.0)
        if now - last < cooldown:
            return True
        self.last_msg_times[mtype] = now
        return False

    def send_text(self, text: str):
        if self.is_closed:
            return
        try:
            frame = encode_ws_frame(text)
            self.writer.write(frame)
        except Exception:
            self.is_closed = True

    async def drain(self):
        try:
            await self.writer.drain()
        except Exception:
            self.is_closed = True

    def close(self):
        self.is_closed = True
        try:
            self.writer.close()
        except Exception:
            pass


async def handle_websocket_message(client: WebSocketClient, payload_text: str):
    try:
        msg = json.loads(payload_text)
    except Exception:
        return
        
    mtype = msg.get("type")
    data = msg.get("data", {})
    
    # 0. PING (Heartbeat for cloud WebSocket keep-alive)
    if mtype == "PING":
        client.send_text(json.dumps({"type": "PONG", "data": {"serverTime": time.time()}}))
        await client.drain()
        return

    # 0b. LIST_ROOMS (Return active rooms and their states)
    if mtype == "LIST_ROOMS":
        client.send_text(json.dumps({
            "type": "ROOM_LIST",
            "data": {"rooms": get_rooms_summary_list()}
        }))
        await client.drain()
        return

    # Anti-rapid-click rate limit per message type on the same connection
    cooldown_map = {
        "CREATE_ROOM": 1.2,
        "JOIN_ROOM": 0.8,
        "START_GAME": 1.0,
        "NEXT_ROUND": 1.0,
        "RESTART_GAME": 1.0,
        "HIT": 0.35,
        "STAY": 0.35,
        "SELECT_TARGET": 0.35,
        "ADD_BOT": 0.25,
    }
    if mtype in cooldown_map and client.is_rate_limited(mtype, cooldown_map[mtype]):
        return

    # 1. CREATE_ROOM
    if mtype == "CREATE_ROOM":
        # Idempotency: if this client already created and is inside a lobby room very recently, return it
        if client.room_code and client.player_id:
            existing_room = ROOMS.get(client.room_code)
            if existing_room and not existing_room.is_destroyed and existing_room.host_id == client.player_id and existing_room.state == "lobby" and (time.time() - existing_room.created_at < 5.0):
                p = existing_room.get_player(client.player_id)
                if p:
                    client.send_text(json.dumps({
                        "type": "ROOM_CREATED",
                        "data": {
                            "roomCode": existing_room.code,
                            "playerId": p.id,
                            "playerName": p.name,
                            "playerAvatar": p.avatar,
                            "state": existing_room.to_dict(for_player_id=p.id)
                        }
                    }))
                    await client.drain()
                    return

        rand_name, rand_avatar = generate_random_profile()
        raw_name = data.get("name", "").strip()
        player_name = raw_name if (raw_name and raw_name not in ["Player", "Host"]) else rand_name
        player_avatar = data.get("avatar", "").strip() or rand_avatar
        target_score = int(data.get("targetScore", 200))
        raw_odds = data.get("showOdds", True)
        show_odds = bool(raw_odds) if isinstance(raw_odds, bool) else (str(raw_odds).lower() != 'false')
        
        room_code = generate_room_code()
        player_id = f"p_{int(time.time()*1000)}_{random.randint(100, 999)}"
        
        host_player = Player(player_id, player_name, player_avatar)
        room = Room(room_code, player_id, target_score=target_score, show_odds=show_odds)
        room.players.append(host_player)
        room.clients[player_id] = client
        ROOMS[room_code] = room
        
        client.player_id = player_id
        client.room_code = room_code
        
        client.send_text(json.dumps({
            "type": "ROOM_CREATED",
            "data": {
                "roomCode": room_code,
                "playerId": player_id,
                "playerName": player_name,
                "playerAvatar": player_avatar,
                "state": room.to_dict(for_player_id=player_id)
            }
        }))
        await client.drain()
        
    # 2. JOIN_ROOM (and Reconnect)
    elif mtype == "JOIN_ROOM":
        room_code = data.get("roomCode", "").strip().upper()
        raw_name = data.get("name", "").strip()
        raw_avatar = data.get("avatar", "").strip()
        existing_player_id = data.get("playerId")
        
        room = ROOMS.get(room_code)
        if not room or room.is_destroyed:
            client.send_text(json.dumps({
                "type": "ERROR",
                "data": {
                    "code": "ROOM_NOT_FOUND",
                    "message": f"Room '{room_code}' not found."
                }
            }))
            await client.drain()
            return
            
        # Check if reconnecting by playerId, OR same WebSocket client already in this room, OR disconnected player with matching name
        player = None
        is_reconnected = False
        if existing_player_id:
            player = room.get_player(existing_player_id)
            if player:
                is_reconnected = not player.is_connected
                player.is_connected = True

        # Anti-duplicate join on same WebSocket connection
        if not player and client.room_code == room_code and client.player_id:
            player = room.get_player(client.player_id)
            if player:
                player.is_connected = True

        if not player and raw_name:
            # 1) If a human player with this exact name is currently disconnected, reclaim seat!
            for p in room.players:
                if not p.is_bot and not p.is_connected and p.name == raw_name:
                    player = p
                    is_reconnected = True
                    player.is_connected = True
                    break
            # 2) Anti-rapid-click across duplicate sockets/requests: if in lobby a human player with this exact name joined within the last 3 seconds, reuse that player instead of creating a duplicate!
            if not player and room.state == "lobby":
                now = time.time()
                for p in room.players:
                    if not p.is_bot and p.name == raw_name and (now - getattr(p, "joined_at", 0) < 3.0):
                        player = p
                        player.is_connected = True
                        break

        if not player:
            if room.state != "lobby":
                # Also allow reclaiming if there is exactly 1 disconnected human seat in an active game
                disconnected_humans = [p for p in room.players if not p.is_bot and not p.is_connected]
                if len(disconnected_humans) == 1:
                    player = disconnected_humans[0]
                    is_reconnected = True
                    player.is_connected = True
                else:
                    client.send_text(json.dumps({
                        "type": "ERROR",
                        "data": {
                            "code": "GAME_IN_PROGRESS",
                            "message": "Game already in progress in this room."
                        }
                    }))
                    await client.drain()
                    return

        if not player:
            if len(room.players) >= 12:
                client.send_text(json.dumps({"type": "ERROR", "data": {"message": "Room is full (max 12 players)."}}))
                await client.drain()
                return
                
            used_names = {p.name for p in room.players}
            rand_name, rand_avatar = generate_random_profile(used_names)
            player_name = raw_name if (raw_name and raw_name not in ["Player", "Guest"]) else rand_name
            if player_name in used_names:
                suffix = 2
                while f"{player_name}_{suffix}" in used_names:
                    suffix += 1
                player_name = f"{player_name}_{suffix}"
            player_avatar = raw_avatar or rand_avatar

            player_id = f"p_{int(time.time()*1000)}_{random.randint(100, 999)}"
            player = Player(player_id, player_name, player_avatar)
            room.players.append(player)
            room.log(f"👋 {player.name} joined the room!")
        elif is_reconnected:
            room.log(f"🔌 {player.name} 断线重连回到了牌桌！")

        old_client = room.clients.get(player.id)
        if old_client and old_client is not client:
            old_client.player_id = None
            old_client.room_code = None
            old_client.close()

        room.clients[player.id] = client
        client.player_id = player.id
        client.room_code = room_code

        # Cancel any pending empty-room destruction timer since a human is now connected
        room.check_empty_and_cleanup(immediate_if_no_connected=False)
        if is_reconnected and room.state == "playing":
            room.schedule_bot_if_needed()
        
        client.send_text(json.dumps({
            "type": "ROOM_JOINED",
            "data": {
                "roomCode": room_code,
                "playerId": player.id,
                "playerName": player.name,
                "playerAvatar": player.avatar,
                "reconnected": is_reconnected,
                "state": room.to_dict(for_player_id=player.id)
            }
        }))
        await client.drain()
        room.broadcast_state()

    # 2b. LEAVE_ROOM (Intentional leave)
    elif mtype == "LEAVE_ROOM":
        room = ROOMS.get(client.room_code or "")
        pid = client.player_id
        client.room_code = None
        client.player_id = None
        if room and pid:
            room.clients.pop(pid, None)
            p = room.get_player(pid)
            if p:
                if room.state == "lobby":
                    room.players = [pl for pl in room.players if pl.id != pid]
                    room.log(f"👋 {p.name} left the table.")
                    if room.host_id == pid:
                        humans = [pl for pl in room.players if not pl.is_bot]
                        if humans:
                            room.host_id = humans[0].id
                else:
                    p.is_connected = False
                    p.is_auto_play = True
                    room.log(f"🚪 {p.name} 离开了房间，已交由 AI 托管。")

                # Immediately destroy room if no connected human players remain!
                if room.check_empty_and_cleanup(immediate_if_no_connected=True):
                    return
                if room.state == "playing":
                    room.schedule_bot_if_needed()
                room.broadcast_state()
        
    # 3. ADD_BOT
    elif mtype == "ADD_BOT":
        room = ROOMS.get(client.room_code or "")
        if not room or room.host_id != client.player_id:
            return
        if len(room.players) >= 10:
            return
            
        profile = random.choice(BOT_PROFILES)
        used_names = {p.name for p in room.players}
        bot_name = profile["name"]
        suffix = 2
        while bot_name in used_names:
            bot_name = f"{profile['name']} {suffix}"
            suffix += 1
            
        bot_id = f"bot_{int(time.time()*1000)}_{random.randint(100, 999)}"
        bot = Player(bot_id, bot_name, profile["avatar"], is_bot=True, bot_personality=profile["personality"])
        room.players.append(bot)
        room.log(f"🤖 Bot {bot.name} ({profile['personality'].title()}) added to table.")
        room.broadcast_state()
        
    # 4. REMOVE_PLAYER / BOT
    elif mtype == "REMOVE_PLAYER":
        target_id = data.get("targetPlayerId")
        room = ROOMS.get(client.room_code or "")
        if not room or room.host_id != client.player_id or not target_id:
            return
            
        p = room.get_player(target_id)
        if p and p.id != room.host_id:
            room.players = [pl for pl in room.players if pl.id != target_id]
            old_c = room.clients.pop(target_id, None)
            if old_c:
                old_c.room_code = None
                old_c.player_id = None
            room.log(f"❌ {p.name} was removed from the table.")
            if room.check_empty_and_cleanup(immediate_if_no_connected=True):
                return
            room.broadcast_state()

    # 5. UPDATE_SETTINGS
    elif mtype == "UPDATE_SETTINGS":
        room = ROOMS.get(client.room_code or "")
        if not room or room.host_id != client.player_id:
            return
        target_score = int(data.get("targetScore", 200))
        if target_score in [50, 100, 150, 200]:
            room.target_score = target_score
            room.log(f"⚙️ Target score set to {target_score} points.")
        if "showOdds" in data:
            raw_odds = data.get("showOdds")
            room.show_odds = bool(raw_odds) if isinstance(raw_odds, bool) else (str(raw_odds).lower() != 'false')
            room.log(f"⚙️ Probability HUD display set to {'ON' if room.show_odds else 'OFF'}.")
        room.broadcast_state()

    # 6. START_GAME
    elif mtype == "START_GAME":
        room = ROOMS.get(client.room_code or "")
        if not room or room.host_id != client.player_id:
            return
        if len(room.players) < 2:
            client.send_text(json.dumps({"type": "ERROR", "data": {"message": "Need at least 2 players (or add bots) to start!"}}))
            await client.drain()
            return
            
        room.start_game()
        room.broadcast_state()

    # 7. HIT
    elif mtype == "HIT":
        room = ROOMS.get(client.room_code or "")
        if not room or room.state != "playing" or room.is_sequence_busy:
            return
        cur = room.current_player()
        if not cur or cur.id != client.player_id:
            return
        if cur.is_auto_play:
            cur.is_auto_play = False
            room.log(f"👤 {cur.name} 恢复了手动操作。")
        room.handle_hit(cur)
        room.broadcast_state()

    # 8. STAY
    elif mtype == "STAY":
        room = ROOMS.get(client.room_code or "")
        if not room or room.state != "playing" or room.is_sequence_busy:
            return
        cur = room.current_player()
        if not cur or cur.id != client.player_id:
            return
        if cur.is_auto_play:
            cur.is_auto_play = False
            room.log(f"👤 {cur.name} 恢复了手动操作。")
        room.handle_stay(cur)
        room.broadcast_state()

    # 9. SELECT_TARGET
    elif mtype == "SELECT_TARGET":
        target_id = data.get("targetPlayerId")
        room = ROOMS.get(client.room_code or "")
        if not room or not room.pending_target or not target_id:
            return
        if room.pending_target["source_id"] != client.player_id:
            return
        p = room.get_player(client.player_id or "")
        if p and p.is_auto_play:
            p.is_auto_play = False
            room.log(f"👤 {p.name} 恢复了手动操作。")
        room.resolve_target_selection(target_id)
        room.broadcast_state()

    # 9b. SET_AUTO_PLAY (Manual toggle or resume from AI takeover)
    elif mtype == "SET_AUTO_PLAY":
        room = ROOMS.get(client.room_code or "")
        if not room:
            return
        p = room.get_player(client.player_id or "")
        if not p or p.is_bot:
            return
        enabled = bool(data.get("enabled", False))
        if p.is_auto_play != enabled:
            p.is_auto_play = enabled
            if enabled:
                room.log(f"🤖 {p.name} 开启了 AI 托管模式。")
            else:
                room.log(f"👤 {p.name} 取消了 AI 托管，恢复手动操作。")
            room.schedule_bot_if_needed()
            room.broadcast_state()

    # 10. NEXT_ROUND
    elif mtype == "NEXT_ROUND":
        room = ROOMS.get(client.room_code or "")
        if not room or room.state != "round_recap":
            return
        dealer_id = room.players[room.dealer_index].id if room.players else None
        if room.host_id != client.player_id and dealer_id != client.player_id:
            return
        room.start_new_round()
        room.broadcast_state()

    # 11. RESTART_GAME
    elif mtype == "RESTART_GAME":
        room = ROOMS.get(client.room_code or "")
        if not room:
            return
        if room.host_id != client.player_id:
            return
        room.start_game()
        room.broadcast_state()

    # 12. CHAT / REACTION
    elif mtype == "CHAT":
        room = ROOMS.get(client.room_code or "")
        if not room:
            return
        p = room.get_player(client.player_id or "")
        if not p:
            return
        text = str(data.get("message", "")).strip()[:100]
        emoji = str(data.get("emoji", "")).strip()[:10]
        if text or emoji:
            payload = {
                "type": "CHAT_MESSAGE",
                "data": {
                    "playerId": p.id,
                    "playerName": p.name,
                    "avatar": p.avatar,
                    "text": text,
                    "emoji": emoji,
                    "timestamp": time.time()
                }
            }
            msg_json = json.dumps(payload)
            for c in room.clients.values():
                c.send_text(msg_json)


# ============================================================================
# HTTP & Connection Dispatcher
# ============================================================================

async def handle_http_request(reader: asyncio.StreamReader, writer: asyncio.StreamWriter, method: str, path: str, headers: Dict[str, str]):
    clean_path = urllib.parse.unquote(path.split("?")[0])
    if clean_path.startswith("/api/room/") and clean_path.endswith("/log"):
        parts = clean_path.strip("/").split("/")
        if len(parts) >= 4 and parts[1] == "room" and parts[3] == "log":
            code = parts[2].upper()
            room = ROOMS.get(code)
            if room:
                data = {
                    "roomCode": room.code,
                    "targetScore": room.target_score,
                    "roundNumber": room.round_number,
                    "state": room.state,
                    "createdAt": room.created_at,
                    "players": [p.to_dict() for p in room.players],
                    "fullLog": room.full_match_log
                }
                body = json.dumps(data, ensure_ascii=False).encode("utf-8")
                header_lines = [
                    "HTTP/1.1 200 OK",
                    "Content-Type: application/json; charset=utf-8",
                    f"Content-Length: {len(body)}",
                    "Cache-Control: no-cache, no-store, must-revalidate",
                    "Access-Control-Allow-Origin: *",
                    "Connection: close",
                    "\r\n"
                ]
                try:
                    writer.write("\r\n".join(header_lines).encode("utf-8"))
                    writer.write(body)
                    await writer.drain()
                except Exception:
                    pass
                finally:
                    writer.close()
                return

    if clean_path == "/api/rooms":
        body = json.dumps({"rooms": get_rooms_summary_list()}).encode("utf-8")
        header_lines = [
            "HTTP/1.1 200 OK",
            "Content-Type: application/json; charset=utf-8",
            f"Content-Length: {len(body)}",
            "Cache-Control: no-cache, no-store, must-revalidate",
            "Access-Control-Allow-Origin: *",
            "Connection: close",
            "\r\n"
        ]
        try:
            writer.write("\r\n".join(header_lines).encode("utf-8"))
            writer.write(body)
            await writer.drain()
        except Exception:
            pass
        finally:
            writer.close()
        return

    if clean_path in ["", "/"]:
        clean_path = "/index.html"
        
    file_path = os.path.normpath(os.path.join(STATIC_DIR, clean_path.lstrip("/")))
    
    # Security: Ensure requested file is inside STATIC_DIR
    if not file_path.startswith(STATIC_DIR) or not os.path.exists(file_path) or os.path.isdir(file_path):
        resp = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found"
        writer.write(resp.encode("utf-8"))
        await writer.drain()
        writer.close()
        return

    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or "application/octet-stream"
    
    try:
        with open(file_path, "rb") as f:
            body = f.read()
            
        header_lines = [
            "HTTP/1.1 200 OK",
            f"Content-Type: {content_type}; charset=utf-8" if "text" in content_type or "javascript" in content_type else f"Content-Type: {content_type}",
            f"Content-Length: {len(body)}",
            "Cache-Control: no-cache, no-store, must-revalidate",
            "Access-Control-Allow-Origin: *",
            "Connection: close",
            "\r\n"
        ]
        writer.write("\r\n".join(header_lines).encode("utf-8"))
        writer.write(body)
        await writer.drain()
    except Exception as e:
        pass
    finally:
        writer.close()


async def client_handler(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    buffer = bytearray()
    
    # Read initial HTTP request line and headers
    while True:
        if b"\r\n\r\n" in buffer or b"\n\n" in buffer:
            break
        try:
            chunk = await asyncio.wait_for(reader.read(4096), timeout=15.0)
        except Exception:
            writer.close()
            return
            
        if not chunk:
            writer.close()
            return
            
        buffer.extend(chunk)

    delimiter = b"\r\n\r\n" if b"\r\n\r\n" in buffer else b"\n\n"
    delim_idx = buffer.index(delimiter)
    header_bytes = buffer[:delim_idx]
    leftover_bytes = buffer[delim_idx + len(delimiter):]
    
    header_text = header_bytes.decode("utf-8", errors="ignore")
    lines = header_text.splitlines()
    if not lines or not lines[0]:
        writer.close()
        return
        
    req_parts = lines[0].split()
    if len(req_parts) < 2:
        writer.close()
        return
        
    method, path = req_parts[0], req_parts[1]
    headers = {}
    for l in lines[1:]:
        if ":" in l:
            k, v = l.split(":", 1)
            headers[k.strip().lower()] = v.strip()
            
    # Check if WebSocket upgrade
    if headers.get("upgrade", "").lower() == "websocket":
        sec_key = headers.get("sec-websocket-key")
        if not sec_key:
            writer.close()
            return
            
        resp = make_ws_handshake_response(sec_key)
        writer.write(resp)
        await writer.drain()
        
        # Switched to WebSocket protocol!
        ws_client = WebSocketClient(reader, writer)
        ws_buffer = bytearray(leftover_bytes)
        
        try:
            while not ws_client.is_closed:
                chunk = await reader.read(4096)
                if not chunk:
                    break
                ws_buffer.extend(chunk)
                
                while True:
                    opcode, payload, consumed = decode_ws_frame(ws_buffer)
                    if consumed == 0:
                        break
                    del ws_buffer[:consumed]
                    
                    if opcode == 0x8: # Close
                        ws_client.close()
                        break
                    elif opcode == 0x9: # Ping
                        pong = bytearray([0x8A, len(payload)]) + payload
                        writer.write(pong)
                        await writer.drain()
                    elif opcode == 0x1: # Text frame
                        if payload:
                            text_msg = payload.decode("utf-8", errors="ignore")
                            await handle_websocket_message(ws_client, text_msg)
        except Exception:
            pass
        finally:
            # Client disconnected
            ws_client.close()
            if ws_client.room_code and ws_client.player_id:
                room = ROOMS.get(ws_client.room_code)
                if room and not room.is_destroyed and room.clients.get(ws_client.player_id) is ws_client:
                    p = room.get_player(ws_client.player_id)
                    if p:
                        p.is_connected = False
                        room.log(f"🔌 {p.name} 断开连接，等待重连...")
                        if not room.check_empty_and_cleanup(immediate_if_no_connected=False):
                            room.broadcast_state()
    else:
        # Standard HTTP file request
        await handle_http_request(reader, writer, method, path, headers)


# ============================================================================
# Main Entry Point
# ============================================================================

async def main(host: str = "0.0.0.0", port: int = 8000):
    os.makedirs(STATIC_DIR, exist_ok=True)
    server = await asyncio.start_server(client_handler, host, port)
    
    addrs = ', '.join(str(sock.getsockname()) for sock in server.sockets)
    print("=" * 60)
    print(f"🃏 Flip 7 Multiplayer Game Server Started!")
    print(f"👉 Serving locally at: http://localhost:{port}")
    print(f"👉 Listening on all network interfaces: {addrs}")
    print(f"👉 Real-time WebSocket support on port {port}")
    print("=" * 60)
    
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    try:
        asyncio.run(main("0.0.0.0", port))
    except KeyboardInterrupt:
        print("\nServer stopped.")
